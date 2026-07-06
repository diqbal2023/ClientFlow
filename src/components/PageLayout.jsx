import Nav from './Nav'

export default function PageLayout({ children }) {
  return (
    <>
      <header className="site-header">
        <Nav />
      </header>
      {children}
    </>
  )
}
