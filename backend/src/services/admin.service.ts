import { prisma } from '../config/db.config';

export const getDashboardStats = async () => {
  const now = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const weekStart = new Date(now);
  weekStart.setDate(now.getDate() - 7);
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

  const [
    totalOrders, todayOrders, weekOrders, monthOrders,
    totalRevenue, todayRevenue, weekRevenue, monthRevenue,
    totalCustomers, newCustomersThisMonth,
    pendingEnquiries, pendingAppointments,
    pendingOrders, lowStockProducts,
  ] = await Promise.all([
    prisma.order.count({ where: { paymentStatus: 'PAID' } }),
    prisma.order.count({ where: { paymentStatus: 'PAID', createdAt: { gte: todayStart } } }),
    prisma.order.count({ where: { paymentStatus: 'PAID', createdAt: { gte: weekStart } } }),
    prisma.order.count({ where: { paymentStatus: 'PAID', createdAt: { gte: monthStart } } }),

    prisma.order.aggregate({ where: { paymentStatus: 'PAID' }, _sum: { totalGBP: true } }),
    prisma.order.aggregate({ where: { paymentStatus: 'PAID', createdAt: { gte: todayStart } }, _sum: { totalGBP: true } }),
    prisma.order.aggregate({ where: { paymentStatus: 'PAID', createdAt: { gte: weekStart } }, _sum: { totalGBP: true } }),
    prisma.order.aggregate({ where: { paymentStatus: 'PAID', createdAt: { gte: monthStart } }, _sum: { totalGBP: true } }),

    prisma.user.count({ where: { role: 'USER' } }),
    prisma.user.count({ where: { role: 'USER', createdAt: { gte: monthStart } } }),

    prisma.bespokeEnquiry.count({ where: { status: { in: ['NEW', 'IN_REVIEW'] } } }),
    prisma.appointment.count({ where: { status: 'PENDING' } }),
    prisma.order.count({ where: { fulfillmentStatus: 'PENDING' } }),
    prisma.product.count({ where: { stockQty: { lte: 5 }, isActive: true } }),
  ]);

  const avgOrderValue =
    totalOrders > 0
      ? Number(totalRevenue._sum.totalGBP ?? 0) / totalOrders
      : 0;

  return {
    orders: { total: totalOrders, today: todayOrders, week: weekOrders, month: monthOrders, pending: pendingOrders },
    revenue: {
      total: Number(totalRevenue._sum.totalGBP ?? 0),
      today: Number(todayRevenue._sum.totalGBP ?? 0),
      week: Number(weekRevenue._sum.totalGBP ?? 0),
      month: Number(monthRevenue._sum.totalGBP ?? 0),
      averageOrderValue: parseFloat(avgOrderValue.toFixed(2)),
    },
    customers: { total: totalCustomers, newThisMonth: newCustomersThisMonth },
    alerts: { pendingEnquiries, pendingAppointments, lowStockProducts },
  };
};

export const getSalesReport = async (from: Date, to: Date) => {
  const orders = await prisma.order.findMany({
    where: { paymentStatus: 'PAID', createdAt: { gte: from, lte: to } },
    include: {
      items: { include: { product: { select: { title: true, sku: true, baseCost: true, category: { select: { name: true } } } } } },
      user: { select: { firstName: true, lastName: true, email: true } },
    },
    orderBy: { createdAt: 'desc' },
  });

  const summary = orders.reduce(
    (acc, order) => {
      acc.totalRevenue += Number(order.totalGBP);
      acc.totalVat += Number(order.vatGBP);
      acc.totalOrders += 1;
      return acc;
    },
    { totalRevenue: 0, totalVat: 0, totalOrders: 0 }
  );

  return { orders, summary };
};

export const getMarginReport = async () => {
  const products = await prisma.product.findMany({
    where: { isActive: true },
    include: {
      category: { select: { name: true } },
      orderItems: { where: { order: { paymentStatus: 'PAID' } } },
    },
    orderBy: { createdAt: 'desc' },
  });

  return products.map((p) => {
    const totalSold = p.orderItems.reduce((sum, i) => sum + i.quantity, 0);
    const totalRevenue = p.orderItems.reduce((sum, i) => sum + Number(i.priceAtPurchaseGBP) * i.quantity, 0);
    const totalCost = Number(p.baseCost) * totalSold;
    const grossProfit = totalRevenue - totalCost;
    const marginPct = totalRevenue > 0 ? (grossProfit / totalRevenue) * 100 : 0;

    return {
      id: p.id, title: p.title, sku: p.sku,
      category: p.category.name,
      baseCost: Number(p.baseCost),
      totalSold, totalRevenue: parseFloat(totalRevenue.toFixed(2)),
      totalCost: parseFloat(totalCost.toFixed(2)),
      grossProfit: parseFloat(grossProfit.toFixed(2)),
      marginPct: parseFloat(marginPct.toFixed(1)),
    };
  });
};

export const getCustomerAnalytics = async () => {
  const customers = await prisma.user.findMany({
    where: { role: 'USER' },
    include: {
      orders: { where: { paymentStatus: 'PAID' }, select: { totalGBP: true, createdAt: true } },
    },
    orderBy: { createdAt: 'desc' },
  });

  return customers.map((c) => {
    const totalSpend = c.orders.reduce((sum, o) => sum + Number(o.totalGBP), 0);
    const orderCount = c.orders.length;
    const lastOrder = c.orders[0]?.createdAt ?? null;

    return {
      id: c.id, firstName: c.firstName, lastName: c.lastName,
      email: c.email, createdAt: c.createdAt, lastLoginAt: c.lastLoginAt,
      orderCount, totalSpend: parseFloat(totalSpend.toFixed(2)),
      averageOrderValue: orderCount > 0 ? parseFloat((totalSpend / orderCount).toFixed(2)) : 0,
      lastOrderDate: lastOrder,
      isReturning: orderCount > 1,
    };
  });
};

export const getRevenueByCategory = async (from: Date, to: Date) => {
  const categories = await prisma.category.findMany({
    include: {
      products: {
        include: {
          orderItems: {
            where: { order: { paymentStatus: 'PAID', createdAt: { gte: from, lte: to } } },
          },
        },
      },
    },
  });

  return categories.map((cat) => {
    const revenue = cat.products.reduce((sum, p) =>
      sum + p.orderItems.reduce((s, i) => s + Number(i.priceAtPurchaseGBP) * i.quantity, 0), 0
    );
    const units = cat.products.reduce((sum, p) =>
      sum + p.orderItems.reduce((s, i) => s + i.quantity, 0), 0
    );
    return { id: cat.id, name: cat.name, revenue: parseFloat(revenue.toFixed(2)), unitsSold: units };
  }).filter((c) => c.revenue > 0);
};
