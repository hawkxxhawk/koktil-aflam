/**
 * Handles pagination functionality for movie listings
 */
const paginationFunctions = {
  data: {
    currentPage: 1,
    moviesPerPage: 50,
  },
  
  /**
   * Get total number of pages
   */
  getTotalPages() {
    return Math.ceil(this.visibleMovies.length / this.moviesPerPage);
  },

  /**
   * Go to specific page
   */
  goToPage(page) {
    if (page === '...') return;
    this.currentPage = page;
    window.scrollTo(0, 0);
  },

  /**
   * Go to previous page
   */
  prevPage() {
    if (this.currentPage > 1) {
      this.currentPage--;
      window.scrollTo(0, 0);
    }
  },

  /**
   * Go to next page
   */
  nextPage() {
    if (this.currentPage < this.getTotalPages()) {
      this.currentPage++;
      window.scrollTo(0, 0);
    }
  },

  /**
   * Get array of pages to display in pagination controls
   */
  getPageRange() {
    const totalPages = this.getTotalPages();
    const current = this.currentPage;
    const range = [];
    
    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) {
        range.push(i);
      }
      return range;
    }

    range.push(1);
    
    if (current <= 4) {
      for (let i = 2; i <= 5; i++) range.push(i);
      range.push('...');
      range.push(totalPages);
    } else if (current >= totalPages - 3) {
      range.push('...');
      for (let i = totalPages - 4; i <= totalPages; i++) range.push(i);
    } else {
      range.push('...');
      for (let i = current - 1; i <= current + 1; i++) range.push(i);
      range.push('...');
      range.push(totalPages);
    }
    
    return range;
  }
};

export { paginationFunctions };