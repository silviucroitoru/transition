import { brand } from '../../config/brand';

export default function HeaderArea({currentPage, progressPages, qLength}) {
  return(
    <>
      <a href={brand.logo.link}>
        <img src={brand.logo.src} alt={brand.logo.alt} className="logo" />
      </a>
      {
        currentPage.position !== 1 && (
          <div className="progress-bar-container" id="progress-bar-container">
            <div className="progress-bar">
              <span id="progress" style={{ width: (progressPages.length * 100 / qLength) + '%'}}></span>
            </div>
          </div>
        )
      }
    </>
  )
}