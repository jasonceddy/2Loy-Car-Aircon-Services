//if something goes wrong and that error was not handled, this middleware will handle it
const errorHandlerMiddleware = (err, req, res, next) => {
  console.error(err)

  const statusCode = err.statusCode || 500
  const message = err.message || "Something went wrong, try again later."

  res.status(statusCode).json({
    error: err.name || "ServerError",
    message,
  })
}

export default errorHandlerMiddleware
