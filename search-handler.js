/**
 * Handles all search-related functionality
 */
const searchFunctions = {
  searchMovies() {
    if (this.searchQuery.trim() === '') {
      this.searchResults = [];
      this.isSearchActive = false;
      return;
    }
    
    // Limit real-time search on older devices
    const query = this.searchQuery.toLowerCase();
    
    // Debounce search on older devices to prevent UI lag
    clearTimeout(this._searchTimeout);
    this._searchTimeout = setTimeout(() => {
      this.searchResults = this.movies
        .filter(movie => !movie.hidden && movie.title.toLowerCase().includes(query))
        .slice(0, 10);
      
      this.isSearchActive = this.searchQuery.length > 0;
    }, 300);
  },

  selectSearchResult(movie) {
    this.searchQuery = movie.title;
    this.searchResults = [];
    this.selectedCategory = 'all';
    this.isSearchActive = true;
    
    // Add 20ms delay for older Android WebViews to properly handle the UI update
    setTimeout(() => {
      const element = document.querySelector(`[data-movie-id="${movie.id}"]`);
      if (element) {
        // Use native scrolling for better performance on older devices
        const yOffset = element.getBoundingClientRect().top + window.pageYOffset - 100;
        window.scrollTo(0, yOffset);
        
        element.classList.add('highlight-movie');
        setTimeout(() => {
          element.classList.remove('highlight-movie');
        }, 2000);
      }
    }, 20);
  },
};

export { searchFunctions };