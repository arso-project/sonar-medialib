import { NavLink } from '@remix-run/react'

export function Navigation () {
  return (
    <nav data-c-navigation>
      <ul>
        <li>
          <NavLink to="/">Index</NavLink>
        </li>
        <li>
          <NavLink to="/search">Search</NavLink>
        </li>
        <li>
          <NavLink to="/import">Import</NavLink>
        </li>
        <li>
          <NavLink to="/feeds">Manage feeds</NavLink>
        </li>
      </ul>
    </nav>
  )
}
