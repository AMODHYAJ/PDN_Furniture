export const getProductImageUrl = (imagePath) => {
  const placeholder = '/images/placeholder-product.jpg';
  
  if (!imagePath) return placeholder;
  
  // If it's already a full URL or data URL, return as-is
  if (imagePath.startsWith('http') || imagePath.startsWith('data:')) {
    return imagePath;
  }
  
  // If the path already includes the full path (from backend)
  if (imagePath.startsWith('/images/products/')) {
    return `http://localhost:5000${imagePath}`;
  }
  
  // If it's just a filename (direct from database)
  if (!imagePath.includes('/')) {
    return `http://localhost:5000/images/products/${imagePath}`;
  }
  
  // Default case - use as-is with backend URL
  return `http://localhost:5000${imagePath}`;
};

export const handleImageError = (e) => {
  // Create a base64 encoded SVG as ultimate fallback
  const svgPlaceholder = 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyMDAgMjAwIj48cmVjdCB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgZmlsbD0iI2VlZSIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBkb21pbmFudC1iYXNlbGluZT0ibWlkZGxlIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmaWxsPSIjYWFhIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTYiPk5vIEltYWdlPC90ZXh0Pjwvc3ZnPg==';
  
  // If we're already showing the SVG, do nothing
  if (e.target.src === svgPlaceholder) return;
  
  console.error('Image failed to load:', e.target.src);
  
  // First try the regular placeholder from public folder
  if (!e.target.src.includes('placeholder-product.jpg')) {
    e.target.src = '/images/placeholder-product.jpg';
    e.target.style.objectFit = 'contain';
    return;
  }
  
  // If that fails, use the SVG fallback
  e.target.src = svgPlaceholder;
  e.target.style.objectFit = 'contain';
  
  // Remove error handler to prevent loops
  e.target.onerror = null;
};