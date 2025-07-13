export async function GET() {
  const robots = `User-agent: *
Allow: /

# Sitemap
Sitemap: https://sbstravel.com/sitemap.xml

# Disallow admin pages
Disallow: /admin/
Disallow: /driver/
Disallow: /customer/

# Allow important pages
Allow: /
Allow: /reservation
Allow: /about
Allow: /contact
Allow: /login
Allow: /register
Allow: /privacy-policy
Allow: /terms-of-service
Allow: /kvkk`;

  return new Response(robots, {
    headers: {
      'Content-Type': 'text/plain',
    },
  });
}