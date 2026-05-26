import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Visit Us | BRM Jewellery',
  description: 'Visit BRM Jewellery in London. Find our opening times, directions, and store information.',
};

const OPENING_HOURS = [
  { day: 'Monday',    time: '10am – 6pm' },
  { day: 'Tuesday',   time: '10am – 6pm' },
  { day: 'Wednesday', time: '10am – 6pm' },
  { day: 'Thursday',  time: '10am – 6pm' },
  { day: 'Friday',    time: '10am – 6pm' },
  { day: 'Saturday',  time: '10am – 6pm' },
  { day: 'Sunday',    time: 'Closed' },
];

const GALLERY_IMAGES = [
  { src: 'https://s0.geograph.org.uk/geophotos/07/85/09/7850993_c0ac1c05.jpg', caption: 'Selkirk Road Store' },
  { src: 'https://tse4.mm.bing.net/th/id/OIP.Zw_t6s7h1uPbUVC7YN5rPgHaFj?rs=1&pid=ImgDetMain&o=7&rm=3', caption: 'Hatton Garden' },
  { src: 'https://images.unsplash.com/photo-1529655683826-aba9b3e77383?w=600&q=80', caption: 'London, United Kingdom' },
  { src: 'https://tse4.mm.bing.net/th/id/OIP.d-DLbe27OVTZHnZWb9LqxgHaEG?rs=1&pid=ImgDetMain&o=7&rm=3', caption: 'Jewellery Quarter' },
];

export default function VisitUsPage() {
  return (
    <div style={{ fontFamily: 'Georgia, serif', color: '#1a1a1a', backgroundColor: '#fff' }}>

      {/* ── Top intro card ── */}
      <section style={{ borderBottom: '1px solid #e8e0d0', padding: '48px 24px' }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto', display: 'flex', gap: '48px', flexWrap: 'wrap', alignItems: 'flex-start' }}>
          <img
            src="https://tse1.mm.bing.net/th/id/OIP.N0Ca2p3aUOlB-O6acddv5QHaFK?rs=1&pid=ImgDetMain&o=7&rm=3"
            alt="BRM Jewellery store front"
            style={{ width: '320px', maxWidth: '100%', height: '220px', objectFit: 'cover', flexShrink: 0 }}
          />
          <div>
            <h1 style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: '2rem', fontWeight: 400, margin: '0 0 16px' }}>
              BRM Jewellery
            </h1>
            <p style={{ margin: '0 0 4px', fontSize: '14px', color: '#444' }}>3 Selkirk Road</p>
            <p style={{ margin: '0 0 4px', fontSize: '14px', color: '#444' }}>London</p>
            <p style={{ margin: '0 0 4px', fontSize: '14px', color: '#444' }}>SW17 0ER</p>
            <p style={{ margin: '16px 0 0', fontSize: '14px', color: '#444' }}>
              Tel: <a href="tel:+442071234567" style={{ color: '#C9A84C', textDecoration: 'none' }}>+44 (0) 20 7123 4567</a>
            </p>
          </div>
        </div>
      </section>

      {/* ── Location gallery ── */}
      <section style={{ padding: '40px 24px', borderBottom: '1px solid #e8e0d0' }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '12px' }}>
            {GALLERY_IMAGES.map((img) => (
              <div key={img.caption} style={{ textAlign: 'center' }}>
                <img
                  src={img.src}
                  alt={img.caption}
                  style={{ width: '100%', height: '160px', objectFit: 'cover', display: 'block' }}
                />
                <p style={{ fontSize: '12px', color: '#666', margin: '8px 0 0', fontStyle: 'italic' }}>{img.caption}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Main visiting info ── */}
      <section style={{ padding: '48px 24px', borderBottom: '1px solid #e8e0d0' }}>
        <div style={{ maxWidth: '780px', margin: '0 auto' }}>
          <h2 style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: '1.75rem', fontWeight: 400, marginBottom: '24px' }}>
            Visiting BRM Jewellery
          </h2>

          <p style={{ fontSize: '14px', fontWeight: 600, marginBottom: '16px', lineHeight: 1.7, color: '#1a1a1a' }}>
            We recommend booking an appointment if you would like to come and look at wedding rings or engagement rings. Please{' '}
            <Link href="/appointments" style={{ color: '#C9A84C', textDecoration: 'underline' }}>contact us to book an appointment</Link>.
          </p>

          <p style={{ fontSize: '14px', color: '#444', lineHeight: 1.85, marginBottom: '16px' }}>
            We know that in a virtual world it is still nice to know that you can visit an online shop in person.
          </p>

          <p style={{ fontSize: '14px', color: '#444', lineHeight: 1.85, marginBottom: '16px' }}>
            In our gallery shop you will see many of the products that are sold on our website with an extended selection in some of the more popular ranges. We have hundreds of wedding rings in all designs and metals for you to look at with a selection and variety which is much larger than you will see in jewellery shops.
          </p>

          <p style={{ fontSize: '14px', color: '#444', lineHeight: 1.85, marginBottom: '16px' }}>
            Here we can offer expert advice and answer questions you may have on any of our products. As we specialise in diamond and wedding rings there is little we do not know, so we may allay all your concerns regarding your purchase of such important items.
          </p>

          <p style={{ fontSize: '14px', color: '#444', lineHeight: 1.85, marginBottom: '16px' }}>
            Although not essential, visiting us helps in ensuring that your purchase will be as perfect as it can be. As we have full control over the manufacture of our own wedding rings even minor adjustments to our items can be made.
          </p>

          <p style={{ fontSize: '14px', color: '#444', lineHeight: 1.85, marginBottom: '16px' }}>
            Our Hatton Garden location puts us in the heart of London's jewellery quarter, surrounded by the finest craftspeople and gem merchants. Customers regularly combine their visit with exploring this historic district.
          </p>

          <p style={{ fontSize: '14px', color: '#444', lineHeight: 1.85, marginBottom: '16px' }}>
            If you wish to chat about and choose your wedding rings, engagement ring, birthday present or gift, drop in or give us a call. If you wish to have a personal appointment at a particular time, we will be happy to have selective products ready for you to view.
          </p>
        </div>
      </section>

      {/* ── Opening times ── */}
      <section style={{ padding: '48px 24px', borderBottom: '1px solid #e8e0d0', backgroundColor: '#faf8f4' }}>
        <div style={{ maxWidth: '780px', margin: '0 auto' }}>
          <h2 style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: '1.5rem', fontWeight: 400, marginBottom: '24px' }}>
            Opening Times:
          </h2>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px' }}>
            <tbody>
              {OPENING_HOURS.map((row, i) => (
                <tr key={row.day} style={{ borderBottom: '1px solid #e8e0d0', backgroundColor: i % 2 === 0 ? '#fff' : 'transparent' }}>
                  <td style={{ padding: '10px 16px', color: '#444', width: '50%' }}>{row.day}</td>
                  <td style={{ padding: '10px 16px', color: '#1a1a1a', fontWeight: row.time === 'Closed' ? 400 : 400 }}>{row.time}</td>
                </tr>
              ))}
            </tbody>
          </table>

          <p style={{ fontSize: '14px', color: '#444', lineHeight: 1.85, marginTop: '24px' }}>
            We recommend booking an appointment if you are visiting us about specific products such as wedding or engagement rings; this is especially important during weekends and holiday periods to avoid waiting. We will then be able to give you the best one-to-one service.
          </p>
        </div>
      </section>

      {/* ── Map + directions ── */}
      <section style={{ padding: '48px 24px', borderBottom: '1px solid #e8e0d0' }}>
        <div style={{ maxWidth: '780px', margin: '0 auto' }}>
          <h2 style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: '1.5rem', fontWeight: 400, marginBottom: '8px' }}>
            How to Find Us
          </h2>
          <p style={{ fontSize: '14px', color: '#444', marginBottom: '24px', lineHeight: 1.7 }}>
            Our Selkirk Road store is easily accessible by public transport. The nearest tube station is Tooting Broadway (Northern line), a short walk away. There is also street parking available nearby.
          </p>

          {/* Google Maps embed – Selkirk Road, London */}
          <div style={{ width: '100%', height: '380px', border: '1px solid #e8e0d0', marginBottom: '20px', overflow: 'hidden' }}>
            <iframe
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2487.4978327178!2d-0.16872!3d51.4273!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x4876077b7ba3a7eb%3A0x1a9d62c5e81e3e2!2sSelkirk+Rd%2C+London+SW17!5e0!3m2!1sen!2suk!4v1"
              width="100%"
              height="380"
              style={{ border: 0 }}
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              title="BRM Jewellery location map"
            />
          </div>

          <p style={{ fontSize: '14px', color: '#444', lineHeight: 1.7 }}>
            What3words:{' '}
            <a
              href="https://w3w.co/photo.print.strut"
              target="_blank"
              rel="noopener noreferrer"
              style={{ color: '#C9A84C', textDecoration: 'underline' }}
            >
              ///photo.print.strut
            </a>
          </p>
        </div>
      </section>

      {/* ── Full contact details ── */}
      <section style={{ padding: '48px 24px', borderBottom: '1px solid #e8e0d0', backgroundColor: '#faf8f4' }}>
        <div style={{ maxWidth: '780px', margin: '0 auto' }}>
          <p style={{ fontSize: '14px', fontWeight: 600, color: '#1a1a1a', marginBottom: '20px' }}>BRM Jewellery</p>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '32px', flexWrap: 'wrap' as const }}>
            <div>
              <p style={{ fontSize: '13px', color: '#444', lineHeight: 2, margin: 0 }}>
                3 Selkirk Road<br />
                London<br />
                SW17 0ER<br />
                United Kingdom
              </p>
            </div>
            <div>
              <p style={{ fontSize: '13px', color: '#444', lineHeight: 2, margin: 0 }}>
                1st Floor Suite 8A<br />
                34–35 Hatton Garden<br />
                London EC1N 8DX<br />
                United Kingdom
              </p>
            </div>
          </div>

          <div style={{ marginTop: '24px', fontSize: '13px', color: '#444', lineHeight: 2 }}>
            <p style={{ margin: 0 }}>
              Tel:{' '}
              <a href="tel:+442071234567" style={{ color: '#C9A84C', textDecoration: 'none' }}>+44 (0) 20 7123 4567</a>
            </p>
            <p style={{ margin: 0 }}>
              E-mail:{' '}
              <a href="mailto:support@brmjewellery.co.uk" style={{ color: '#C9A84C', textDecoration: 'none' }}>support@brmjewellery.co.uk</a>
            </p>
            <p style={{ margin: 0 }}>
              Website:{' '}
              <a href="/" style={{ color: '#C9A84C', textDecoration: 'none' }}>www.brmjewellery.co.uk</a>
            </p>
          </div>
        </div>
      </section>


    </div>
  );
}
