import api from './auth'


export async function changePassword(
  currentPassword,
  newPassword,
) {
  const response = await api.patch(
    '/users/me/password',
    {
      current_password: currentPassword,
      new_password: newPassword,
    },
  )

  return response.data
}


export async function withdrawLocalAccount(
  currentPassword,
) {
  const response = await api.delete(
    '/users/me',
    {
      data: {
        current_password: currentPassword,
      },
    },
  )

  return response.data
}


export async function withdrawSocialAccount(
  provider,
  code,
) {
  const response = await api.delete(
    '/users/me',
    {
      data: {
        provider,
        code,
      },
    },
  )

  return response.data
}