import Nav from './Nav'

export default function PageLayout({ children }) {
  return (
    <>
      <Nav />
      {children}
    </>
  )
}
