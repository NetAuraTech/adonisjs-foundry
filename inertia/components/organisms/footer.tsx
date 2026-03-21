/**
 * Global page footer.
 *
 * Sticks to the bottom of the page via `mt-auto` when the parent uses a
 * flex column layout (e.g. `#page-wrapper`). The inner `container` utility
 * constrains content width and adds consistent horizontal padding — place
 * links, legal copy, or social icons inside it.
 *
 * Currently renders an empty container as a structural placeholder.
 *
 * @example
 * // Inside a flex-col page wrapper
 * <div id="page-wrapper">
 *   <Header />
 *   <main className="flex-1">...</main>
 *   <Footer />
 * </div>
 */
export function Footer() {
  return (
    <footer className="mt-auto p-4 bg-surface border-t border-edge">
      <div className="container"></div>
    </footer>
  )
}
