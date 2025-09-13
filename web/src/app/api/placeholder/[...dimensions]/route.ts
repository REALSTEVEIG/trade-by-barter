import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  _request: NextRequest,
  { params }: { params: { dimensions: string[] } }
) {
  try {
    const dimensions = params.dimensions;
    
    if (!dimensions || dimensions.length < 2) {
      return NextResponse.json(
        { error: 'Missing width or height parameter' },
        { status: 400 }
      );
    }
    
    const [width, height] = dimensions;
    
    // Validate dimensions
    const w = parseInt(width || '0');
    const h = parseInt(height || '0');
    
    if (isNaN(w) || isNaN(h) || w <= 0 || h <= 0 || w > 2000 || h > 2000) {
      return NextResponse.json(
        { error: 'Invalid dimensions' },
        { status: 400 }
      );
    }

    // Generate a simple SVG placeholder
    const svg = `
      <svg width="${w}" height="${h}" xmlns="http://www.w3.org/2000/svg">
        <rect width="100%" height="100%" fill="#f3f4f6"/>
        <text x="50%" y="50%" font-family="Arial, sans-serif" font-size="16" 
              text-anchor="middle" dy=".3em" fill="#9ca3af">
          ${w} × ${h}
        </text>
      </svg>
    `;

    return new NextResponse(svg, {
      headers: {
        'Content-Type': 'image/svg+xml',
        'Cache-Control': 'public, max-age=31536000, immutable',
      },
    });
  } catch (error) {
    console.error('Placeholder API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}