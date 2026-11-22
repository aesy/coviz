export function BackButton() {
  return (
    <button
      class="btn"
      onClick={() => history.back()}
      aria-label="Back to the previous view"
    >
      <svg width="10" height="10" viewBox="0 0 10 10" aria-hidden="true">
        <path
          d="M7 1L3 5l4 4"
          fill="none"
          stroke="currentColor"
          stroke-width="1.6"
          stroke-linecap="round"
          stroke-linejoin="round"
        />
      </svg>
      Back
    </button>
  );
}
