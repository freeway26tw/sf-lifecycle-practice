/**
 * Visualforce controller for the interactive OpenAI web search demo page. Collects an API key
 * and search query from the page, delegates the callout to OpenAIWebSearchAction, and exposes
 * the parsed response back to the page.
 */
public with sharing class OpenAIWebSearchController {
  @TestVisible
  private static final String VALIDATION_ERROR_MESSAGE = 'Please provide both an API key and a search query.';

  @TestVisible
  private static final String GENERIC_ERROR_MESSAGE = 'Unable to complete the OpenAI search. Please try again.';

  private static final String STATUS_COMPLETED = 'completed';

  public transient String apiKey { get; set; }
  public String searchQuery { get; set; }

  public String responseText { get; private set; }
  public String citations { get; private set; }
  public String status { get; private set; }
  public Integer inputTokens { get; private set; }
  public Integer outputTokens { get; private set; }
  public Integer totalTokens { get; private set; }
  public String errorMessage { get; private set; }

  public Boolean hasResult {
    get {
      return status == STATUS_COMPLETED;
    }
  }

  public Boolean hasError {
    get {
      return String.isNotBlank(errorMessage);
    }
  }

  public Boolean hasCitations {
    get {
      return String.isNotBlank(citations);
    }
  }

  public Boolean hasTokenStats {
    get {
      return totalTokens != null;
    }
  }

  public String statusBadgeStyleClass {
    get {
      return status == STATUS_COMPLETED
        ? 'oai-badge-success'
        : 'oai-badge-error';
    }
  }

  public List<String> citationLines {
    get {
      return String.isBlank(citations)
        ? new List<String>()
        : citations.split('\n');
    }
  }

  /**
   * Invokes OpenAIWebSearchAction with the page's apiKey/searchQuery inputs and populates
   * the page's result properties from the response.
   * @return null (the page re-renders via AJAX; no navigation occurs)
   */
  public PageReference search() {
    errorMessage = null;
    status = null;

    if (String.isBlank(apiKey) || String.isBlank(searchQuery)) {
      errorMessage = VALIDATION_ERROR_MESSAGE;
      return null;
    }

    OpenAIWebSearchAction.OpenAIWebSearchInput input = new OpenAIWebSearchAction.OpenAIWebSearchInput();
    input.apiKey = apiKey;
    input.searchQuery = searchQuery;

    try {
      OpenAIWebSearchAction.OpenAIWebSearchOutput result = OpenAIWebSearchAction.callOpenAIWebSearch(
        new List<OpenAIWebSearchAction.OpenAIWebSearchInput>{ input }
      )[0];

      status = result.status;
      responseText = result.responseText;
      citations = result.citations;
      inputTokens = result.inputTokens;
      outputTokens = result.outputTokens;
      totalTokens = result.totalTokens;

      if (status != STATUS_COMPLETED) {
        errorMessage = String.isNotBlank(responseText)
          ? responseText
          : GENERIC_ERROR_MESSAGE;
      }
    } catch (Exception ex) {
      status = 'exception';
      errorMessage = GENERIC_ERROR_MESSAGE;
    }

    return null;
  }
}