import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Hallmarks On Precious Metals | BRM Jewellery',
  description: 'All BRM Jewellery pieces carry the official British Assay Office hallmark as required by the Hallmarking Act 1973.',
};

export default function HallmarkingPage() {
  return (
    <div style={{ fontFamily: 'Georgia, serif', color: '#1a1a1a', backgroundColor: '#fff' }}>
      <div style={{ maxWidth: '860px', margin: '0 auto', padding: '48px 24px 64px' }}>

        <h1 style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: '2rem', fontWeight: 400, marginBottom: '24px' }}>
          Hallmarks On Precious Metals
        </h1>

        <p style={{ fontSize: '14px', color: '#444', lineHeight: 1.85, marginBottom: '16px' }}>
          All products supplied by BRM Jewellery will bear the official British Assay Office hallmark as required by the Hallmarking Act 1973 and any subsequent amendments, unless specifically specified otherwise.
        </p>

        <p style={{ fontSize: '14px', color: '#444', lineHeight: 1.85, marginBottom: '32px' }}>
          Detailed information regarding the current legislation for Hallmarking can be found on the{' '}
          <a
            href="https://www.assayofficelondon.co.uk/"
            target="_blank"
            rel="noopener noreferrer"
            style={{ color: '#1a1a1a', textDecoration: 'underline' }}
          >
            London Assay Office
          </a>{' '}
          website.
        </p>

        <h2 style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: '1.25rem', fontWeight: 600, marginBottom: '16px', fontStyle: 'normal' }}>
          Our commitment to hallmarking
        </h2>

        <p style={{ fontSize: '14px', color: '#444', lineHeight: 1.85, marginBottom: '16px' }}>
          When it comes to manufacturing jewellery and silverware, precious metals (silver, palladium, gold and platinum) are rarely used in their purest form. Instead they are usually alloyed with lesser metals to achieve a desired strength, durability, and colour.
        </p>

        <p style={{ fontSize: '14px', color: '#444', lineHeight: 1.85, marginBottom: '16px' }}>
          It is not possible to detect the precious metal content of an item by sight or by touch. It is, therefore, a legal requirement to have items consisting of silver, palladium, gold or platinum independently tested and then hallmarked before they can be described as such. Items must bear a hallmark at point of sale, subject to the following weight exemptions:
        </p>

        <p style={{ fontSize: '14px', color: '#444', lineHeight: 1.85, marginBottom: '16px' }}>
          Silver: mandatory for items above 7.78 grams; gold: mandatory for items above 1 gram; palladium: mandatory for items above 1 gram; platinum: mandatory for items above 0.5 grams.
        </p>

        <p style={{ fontSize: '14px', color: '#444', lineHeight: 1.85, marginBottom: '16px' }}>
          BRM Jewellery is registered with the London Assay Office, ensuring our precious metal jewellery is compliant with the UK's hallmarking regulations. All stock is subject to an internal confirmation process to ensure it meets the UK's hallmarking regulations before it is dispatched to our customers.
        </p>

        <p style={{ fontSize: '14px', color: '#444', lineHeight: 1.85, marginBottom: '16px' }}>
          For articles that are below the UK Hallmarking Act's mandatory weight for hallmarking, BRM Jewellery operates a separate due diligence process which involves periodic voluntary testing of items that fall below the mandatory weight to ensure they meet the minimum fineness requirement.
        </p>

        <p style={{ fontSize: '14px', color: '#444', lineHeight: 1.85, marginBottom: '40px' }}>
          We are an Assay Assured Jewellery Retailer. Assay Assured status is only given to retailers who have been independently audited and verified by Assay Assured which is run and overseen by the London Assay Office and ensures that all precious metal jewellery (except items exempt by weight) are independently tested and hallmarked.
        </p>

        {/* Hallmark guide image */}
        <div style={{ marginBottom: '48px' }}>
          <img
            src="/assets/hallmarking-guide.webp"
            alt="Ask if it's hallmarked – UK Hallmarking Guide"
            style={{ maxWidth: '420px', width: '100%', height: 'auto', display: 'block' }}
          />
        </div>

   

        {/* Contact / address */}
        <div style={{ borderTop: '1px solid #e8e0d0', paddingTop: '32px' }}>
          <p style={{ fontSize: '13px', fontWeight: 600, color: '#1a1a1a', margin: '0 0 8px' }}>Visit Us In Store</p>

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '32px', marginBottom: '16px' }}>
            <div>
              <p style={{ fontSize: '13px', color: '#444', lineHeight: 1.9, margin: 0 }}>
                3 Selkirk Road<br />
                London<br />
                SW17 0ER
              </p>
            </div>
            <div>
              <p style={{ fontSize: '13px', color: '#444', lineHeight: 1.9, margin: 0 }}>
                1st Floor Suite 8A<br />
                34–35 Hatton Garden<br />
                London EC1N 8DX
              </p>
            </div>
          </div>

          <p style={{ fontSize: '13px', color: '#444', lineHeight: 1.9, margin: '0 0 4px' }}>
            Tel:{' '}
            <a href="tel:+442071234567" style={{ color: '#1a1a1a', textDecoration: 'underline' }}>+44 (0) 20 7123 4567</a>
          </p>
          <p style={{ fontSize: '13px', color: '#444', lineHeight: 1.9, margin: 0 }}>
            E-mail:{' '}
            <a href="mailto:support@brmjewellery.co.uk" style={{ color: '#1a1a1a', textDecoration: 'underline' }}>support@brmjewellery.co.uk</a>
            {' '}or use our{' '}
            <Link href="/contact" style={{ color: '#1a1a1a', textDecoration: 'underline' }}>Contact Form</Link>
          </p>
        </div>

      </div>
    </div>
  );
}
