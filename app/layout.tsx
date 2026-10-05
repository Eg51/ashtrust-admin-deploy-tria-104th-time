// app/layout.tsx
import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import DynamicEye from "@/app/components/DynamicEye";
import MotionProvider from "@/app/components/MotionProvider";

const poppins = localFont({
  src: [
    { path: "../public/fonts/Poppins-Thin.ttf", weight: "100", style: "normal" },
    { path: "../public/fonts/Poppins-ThinItalic.ttf", weight: "100", style: "italic" },
    { path: "../public/fonts/Poppins-ExtraLight.ttf", weight: "200", style: "normal" },
    { path: "../public/fonts/Poppins-ExtraLightItalic.ttf", weight: "200", style: "italic" },
    { path: "../public/fonts/Poppins-Light.ttf", weight: "300", style: "normal" },
    { path: "../public/fonts/Poppins-LightItalic.ttf", weight: "300", style: "italic" },
    { path: "../public/fonts/Poppins-Regular.ttf", weight: "400", style: "normal" },
    { path: "../public/fonts/Poppins-Italic.ttf", weight: "400", style: "italic" },
    { path: "../public/fonts/Poppins-Medium.ttf", weight: "500", style: "normal" },
    { path: "../public/fonts/Poppins-MediumItalic.ttf", weight: "500", style: "italic" },
    { path: "../public/fonts/Poppins-SemiBold.ttf", weight: "600", style: "normal" },
    { path: "../public/fonts/Poppins-SemiBoldItalic.ttf", weight: "600", style: "italic" },
    { path: "../public/fonts/Poppins-Bold.ttf", weight: "700", style: "normal" },
    { path: "../public/fonts/Poppins-BoldItalic.ttf", weight: "700", style: "italic" },
    { path: "../public/fonts/Poppins-ExtraBold.ttf", weight: "800", style: "normal" },
    { path: "../public/fonts/Poppins-ExtraBoldItalic.ttf", weight: "800", style: "italic" },
    { path: "../public/fonts/Poppins-Black.ttf", weight: "900", style: "normal" },
    { path: "../public/fonts/Poppins-BlackItalic.ttf", weight: "900", style: "italic" },
  ],
  variable: "--font-poppins",
  display: "swap",
});

const SITE_URL = "https://www.ashtrustbnk.com";
const OG_IMAGE = `${SITE_URL}/loadLogo_shield_smooth.png`; // swap to /preview.png once you add one
const DESCRIPTION = "Modern Banking. Timeless Trust.";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),

  title: {
    default: "AshTrust Bank",
    template: "%s | AshTrust Bank",
  },
  description: DESCRIPTION,
  keywords: [
    "AshTrust Bank",
    "online banking",
    "secure banking",
    "international transfers",
    "military-grade encryption",
    "predictive analytics",
    "global payments",
    "finance",
    "investments",
    "crypto",
    "bill payments",
  ],
  authors: [{ name: "AshTrust Bank" }],
  creator: "AshTrust Bank",
  applicationName: "AshTrust Bank",

  icons: {
    icon: "/favicon.ico",
    apple: "/apple-touch-icon.png",
  },

  openGraph: {
    type: "website",
    url: SITE_URL,
    siteName: "AshTrust Bank",
    title: "AshTrust Bank",
    description: DESCRIPTION,
    images: [
      {
        url: OG_IMAGE,
        width: 1200,
        height: 630,
        alt: "AshTrust Bank — Modern banking dashboard preview",
      },
    ],
  },

  twitter: {
    card: "summary_large_image",
    title: "AshTrust Bank",
    description: DESCRIPTION,
    // FIX: removed the double "https://https://" typo
    images: [OG_IMAGE],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${poppins.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col">
        <MotionProvider>
          {children}
          <DynamicEye />
        </MotionProvider>
      </body>
    </html>
  );
}

// // import type { Metadata } from "next";
// // import localFont from "next/font/local";
// // import "./globals.css";

// // const poppins = localFont({
// //   src: [
// //     {
// //       path: "../public/fonts/Poppins-Thin.ttf",
// //       weight: "100",
// //       style: "normal",
// //     },
// //     {
// //       path: "../public/fonts/Poppins-ThinItalic.ttf",
// //       weight: "100",
// //       style: "italic",
// //     },
// //     {
// //       path: "../public/fonts/Poppins-ExtraLight.ttf",
// //       weight: "200",
// //       style: "normal",
// //     },
// //     {
// //       path: "../public/fonts/Poppins-ExtraLightItalic.ttf",
// //       weight: "200",
// //       style: "italic",
// //     },
// //     {
// //       path: "../public/fonts/Poppins-Light.ttf",
// //       weight: "300",
// //       style: "normal",
// //     },
// //     {
// //       path: "../public/fonts/Poppins-LightItalic.ttf",
// //       weight: "300",
// //       style: "italic",
// //     },
// //     {
// //       path: "../public/fonts/Poppins-Regular.ttf",
// //       weight: "400",
// //       style: "normal",
// //     },
// //     {
// //       path: "../public/fonts/Poppins-Italic.ttf",
// //       weight: "400",
// //       style: "italic",
// //     },
// //     {
// //       path: "../public/fonts/Poppins-Medium.ttf",
// //       weight: "500",
// //       style: "normal",
// //     },
// //     {
// //       path: "../public/fonts/Poppins-MediumItalic.ttf",
// //       weight: "500",
// //       style: "italic",
// //     },
// //     {
// //       path: "../public/fonts/Poppins-SemiBold.ttf",
// //       weight: "600",
// //       style: "normal",
// //     },
// //     {
// //       path: "../public/fonts/Poppins-SemiBoldItalic.ttf",
// //       weight: "600",
// //       style: "italic",
// //     },
// //     {
// //       path: "../public/fonts/Poppins-Bold.ttf",
// //       weight: "700",
// //       style: "normal",
// //     },
// //     {
// //       path: "../public/fonts/Poppins-BoldItalic.ttf",
// //       weight: "700",
// //       style: "italic",
// //     },
// //     {
// //       path: "../public/fonts/Poppins-ExtraBold.ttf",
// //       weight: "800",
// //       style: "normal",
// //     },
// //     {
// //       path: "../public/fonts/Poppins-ExtraBoldItalic.ttf",
// //       weight: "800",
// //       style: "italic",
// //     },
// //     {
// //       path: "../public/fonts/Poppins-Black.ttf",
// //       weight: "900",
// //       style: "normal",
// //     },
// //     {
// //       path: "../public/fonts/Poppins-BlackItalic.ttf",
// //       weight: "900",
// //       style: "italic",
// //     },
// //   ],
// //   variable: "--font-poppins",
// //   display: "swap",
// // });

// // export const metadata: Metadata = {
// //   title: 'AshTrust Bank',
// //   description: 'Modern Banking. Timeless Trust.',
// //   keywords: ["finance", "investments", "bills", "crypto", "banking"],
// //   icons: {
// //     icon: '/favicon.ico',
// //     apple: '/apple-touch-icon.png',
// //   },
// //   openGraph: {
// //     title: 'AshTrust Bank',
// //     description: 'Modern Banking. Timeless Trust.',
// //     url: "https://just-deploy-rho.vercel.app",
// //     siteName: "AshTrust Bank",
// //     images: [
// //       {
// //         url: "https://just-deploy-rho.vercel.app/preview.png", // ✅ Replace with actual URL
// //         width: 1200,
// //         height: 630,
// //         alt: "AshTrust Bank Preview",
// //       },
// //     ],
// //     type: "website",
// //   },
// //   twitter: {
// //     card: "summary_large_image",
// //     title: 'AshTrust Bank',
// //     description: 'Modern Banking. Timeless Trust.',
// //     images: ["https://just-deploy-rho.vercel.app/loadLogo_shield_smooth.png"], // ✅ Replace with actual URL
// //   },
// // };

// // export default function RootLayout({
// //   children,
// // }: Readonly<{
// //   children: React.ReactNode;
// // }>) {
// //   return (
// //     <html
// //       lang="en"
// //       className={`${poppins.variable} h-full antialiased`}
// //     >
// //       <body className="min-h-full flex flex-col">{children}</body>
// //     </html>
// //   );
// // }
// import type { Metadata } from "next";
// import localFont from "next/font/local";
// import "./globals.css";
// import DynamicEye from "@/app/components/DynamicEye";

// const poppins = localFont({
//   src: [
//     {
//       path: "../public/fonts/Poppins-Thin.ttf",
//       weight: "100",
//       style: "normal",
//     },
//     {
//       path: "../public/fonts/Poppins-ThinItalic.ttf",
//       weight: "100",
//       style: "italic",
//     },
//     {
//       path: "../public/fonts/Poppins-ExtraLight.ttf",
//       weight: "200",
//       style: "normal",
//     },
//     {
//       path: "../public/fonts/Poppins-ExtraLightItalic.ttf",
//       weight: "200",
//       style: "italic",
//     },
//     {
//       path: "../public/fonts/Poppins-Light.ttf",
//       weight: "300",
//       style: "normal",
//     },
//     {
//       path: "../public/fonts/Poppins-LightItalic.ttf",
//       weight: "300",
//       style: "italic",
//     },
//     {
//       path: "../public/fonts/Poppins-Regular.ttf",
//       weight: "400",
//       style: "normal",
//     },
//     {
//       path: "../public/fonts/Poppins-Italic.ttf",
//       weight: "400",
//       style: "italic",
//     },
//     {
//       path: "../public/fonts/Poppins-Medium.ttf",
//       weight: "500",
//       style: "normal",
//     },
//     {
//       path: "../public/fonts/Poppins-MediumItalic.ttf",
//       weight: "500",
//       style: "italic",
//     },
//     {
//       path: "../public/fonts/Poppins-SemiBold.ttf",
//       weight: "600",
//       style: "normal",
//     },
//     {
//       path: "../public/fonts/Poppins-SemiBoldItalic.ttf",
//       weight: "600",
//       style: "italic",
//     },
//     {
//       path: "../public/fonts/Poppins-Bold.ttf",
//       weight: "700",
//       style: "normal",
//     },
//     {
//       path: "../public/fonts/Poppins-BoldItalic.ttf",
//       weight: "700",
//       style: "italic",
//     },
//     {
//       path: "../public/fonts/Poppins-ExtraBold.ttf",
//       weight: "800",
//       style: "normal",
//     },
//     {
//       path: "../public/fonts/Poppins-ExtraBoldItalic.ttf",
//       weight: "800",
//       style: "italic",
//     },
//     {
//       path: "../public/fonts/Poppins-Black.ttf",
//       weight: "900",
//       style: "normal",
//     },
//     {
//       path: "../public/fonts/Poppins-BlackItalic.ttf",
//       weight: "900",
//       style: "italic",
//     },
//   ],
//   variable: "--font-poppins",
//   display: "swap",
// });

// export const metadata: Metadata = {
//   title: 'AshTrust Bank',
//   description: 'Modern Banking. Timeless Trust.',
//   keywords: ["finance", "investments", "bills", "crypto", "banking"],
//   icons: {
//     icon: '/favicon.ico',
//     apple: '/apple-touch-icon.png',
//   },
//   openGraph: {
//     title: 'AshTrust Bank',
//     description: 'Modern Banking. Timeless Trust',
//     url: "https://www.ashtrustbnk.com",
//     siteName: "AshTrust Bank",
//     images: [
//       {
//         url: "https://www.ashtrustbnk.com/preview.png",
//         width: 1200,
//         height: 630,
//         alt: "Web App Preview",
//       },
//     ],
//     type: "website",
//   },
//   twitter: {
//     card: "summary_large_image",
//     title: 'AshTrust Bank',
//     description: 'Modern Banking. Timeless Trust.',
//     images: ["https://https://www.ashtrustbnk.com/loadLogo_shield_smooth.png"],
//   },
// };

// export default function RootLayout({
//   children,
// }: Readonly<{
//   children: React.ReactNode;
// }>) {
//   return (
//     <html
//       lang="en"
//       className={`${poppins.variable} h-full antialiased`}
//     >
//       <body className="min-h-full flex flex-col">
//         {children}
//         <DynamicEye />
//       </body>
//     </html>
//   );
// }