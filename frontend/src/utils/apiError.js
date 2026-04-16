export function getApiErrorMessage(error, fallback = 'Something went wrong.') {
  const responseData = error?.response?.data;

  if (responseData?.errors && Array.isArray(responseData.errors) && responseData.errors.length > 0) {
    return responseData.errors[0]?.message || fallback;
  }

  if (responseData?.message) {
    return responseData.message;
  }

  return fallback;
}
