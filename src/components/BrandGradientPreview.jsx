import { getBrandGradient } from '../lib/businessProfile'

export default function BrandGradientPreview({ business, className = '', tall = false }) {
  return (
    <div
      className={`brand-gradient-preview${tall ? ' brand-gradient-preview-tall' : ''}${className ? ` ${className}` : ''}`}
      style={{ background: getBrandGradient(business) }}
      aria-label="Brand gradient preview"
      role="img"
    />
  )
}
