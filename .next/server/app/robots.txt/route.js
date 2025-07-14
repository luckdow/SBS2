"use strict";(()=>{var e={};e.id=703,e.ids=[703],e.modules={30517:e=>{e.exports=require("next/dist/compiled/next-server/app-route.runtime.prod.js")},28818:(e,t,o)=>{o.r(t),o.d(t,{headerHooks:()=>d,originalPathname:()=>w,patchFetch:()=>x,requestAsyncStorage:()=>p,routeModule:()=>i,serverHooks:()=>c,staticGenerationAsyncStorage:()=>u,staticGenerationBailout:()=>m});var r={};o.r(r),o.d(r,{GET:()=>n});var a=o(95419),l=o(69108),s=o(99678);async function n(){let e=`User-agent: *
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
Allow: /kvkk`;return new Response(e,{headers:{"Content-Type":"text/plain"}})}let i=new a.AppRouteRouteModule({definition:{kind:l.x.APP_ROUTE,page:"/robots.txt/route",pathname:"/robots.txt",filename:"route",bundlePath:"app/robots.txt/route"},resolvedPagePath:"/home/runner/work/SBS2/SBS2/app/robots.txt/route.ts",nextConfigOutput:"export",userland:r}),{requestAsyncStorage:p,staticGenerationAsyncStorage:u,serverHooks:c,headerHooks:d,staticGenerationBailout:m}=i,w="/robots.txt/route";function x(){return(0,s.patchFetch)({serverHooks:c,staticGenerationAsyncStorage:u})}},95419:(e,t,o)=>{e.exports=o(30517)}};var t=require("../../webpack-runtime.js");t.C(e);var o=e=>t(t.s=e),r=t.X(0,[638],()=>o(28818));module.exports=r})();