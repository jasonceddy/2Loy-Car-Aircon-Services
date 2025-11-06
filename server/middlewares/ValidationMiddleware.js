//checks if email or phone number already exists
export const validate = (schema) => (req, res, next) => {
  const result = schema.safeParse(req.body)

  if (!result.success)
    return res.status(400).json({ message: result.error.flatten().fieldErrors })

  req.body = result.data
  next()
}
