export async function handleApiResponseError(
  response: Response,
  defaultErrorMessage: string,
): Promise<never> {
  const hasErrorBody = response.headers.get('content-type')?.includes('application/json');

  if (hasErrorBody) {
    const errorBody = await response.json() as { message?: string };
    const hasErrorMessage = errorBody.message !== undefined;
    throw new Error(hasErrorMessage ? errorBody.message : defaultErrorMessage);
  }

  throw new Error(defaultErrorMessage);
}
