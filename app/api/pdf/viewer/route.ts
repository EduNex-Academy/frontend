import { NextRequest, NextResponse } from 'next/server';

// Force dynamic rendering for this route since it uses search params
export const dynamic = 'force-dynamic';

/**
 * This API route acts as a proxy for PDF content.
 * It allows embedding a PDF viewer for files that have CORS restrictions.
 */
export async function GET(request: NextRequest) {
  try {
    // Get the URL parameter
    const searchParams = request.nextUrl.searchParams;
    const url = searchParams.get('url');

    if (!url) {
      return new NextResponse('Missing URL parameter', { status: 400 });
    }

    // Create an HTML response with a PDF viewer
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>PDF Viewer</title>
        <style>
          body, html {
            margin: 0;
            padding: 0;
            height: 100%;
            overflow: hidden;
          }
          #pdf-viewer {
            width: 100%;
            height: 100%;
            border: none;
          }
        </style>
      </head>
      <body>
        <iframe 
          id="pdf-viewer" 
          src="https://docs.google.com/viewer?url=${encodeURIComponent(url)}&embedded=true"
          allowfullscreen
        ></iframe>
      </body>
      </html>
    `;

    // Return the HTML response
    return new NextResponse(html, {
      headers: {
        'Content-Type': 'text/html',
        'Cache-Control': 'public, max-age=3600' // Cache for 1 hour
      }
    });
  } catch (error) {
    console.error('Error in PDF viewer proxy:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}