export function NotFound() {
  return (
    <div className="flex h-screen flex-col items-center justify-center gap-4">
      <div className="flex flex-col items-center text-5xl">
        <span>404</span>
        <h1>Not Found</h1>
      </div>
      <a className="text-xl underline" href="/login">
        Login Page
      </a>
    </div>
  )
}
