export interface DataParam {
  /**
   * The input text to be translated.
   */
  input: string;
  /**
   * The direction of the translation. passing en translate
   *  from bo to en and passing bo translate from en to bo.
   */
  direction?: "en" | "bo";

  /**
   * The token to be used for the translation.
   */
  csrfToken: string;

  /**
   * The cookie to be used for the translation.
   */
  cookie: string;
}
