class CountriesPage {
  private countriesContainer: HTMLDivElement;
  private paginationContainer: HTMLDivElement;
  private searchButton: HTMLButtonElement;
  private nameInput: HTMLInputElement;
  private capitalInput: HTMLInputElement;
  private currencyInput: HTMLInputElement;
  private languageInput: HTMLInputElement;
  private loadMoreButton: HTMLButtonElement;
  private page: number;
  private totalPages: number;

  
  constructor() {
    this.countriesContainer = document.getElementById(
      'countries-container',
    ) as HTMLDivElement;
    this.paginationContainer = document.getElementById(
      'pagination-container',
    ) as HTMLDivElement;
    this.searchButton = document.getElementById(
      'search-button',
    ) as HTMLButtonElement;
    this.nameInput = document.getElementById('nameInput') as HTMLInputElement;
    this.capitalInput = document.getElementById('capitalInput') as HTMLInputElement;
    this.currencyInput = document.getElementById('currencyInput') as HTMLInputElement;
    this.languageInput = document.getElementById('languageInput') as HTMLInputElement;
    this.loadMoreButton = document.getElementById('load-more') as HTMLButtonElement;
    this.page = 1;

    this.searchButton.addEventListener('click', async () => {
      this.page = 1;
      await this.renderCountries();
    });

    this.loadMoreButton.addEventListener('click', async () => {
      this.page++;
      await this.renderCountries();
    });

    // Initial load
    this.renderCountries();
  }

  private async fetchData(): Promise<{ countries: Country[]; totalCount: number }> {
    try {
      const queryParams = {
        _page: this.page.toString(),
        _limit: '20',
        _sort: '', // Add your sorting criteria here
        name_like: this.nameInput.value,
        capital_like: this.capitalInput.value,
        "currency.name_like": this.currencyInput.value,
        "language.name_like": this.languageInput.value,
      };

      const queryString = Object.entries(queryParams)
        .filter(([key, value]) => value !== '')
        .map(([key, value]) => `${key}=${value}`)
        .join('&');

      const apiUrl = `http://localhost:3004/countries?${queryString}`;
      const response = await fetch(apiUrl);
      const totalCount = Number(response.headers.get('X-Total-Count'));
      const countries: Country[] = await response.json();
      return { countries, totalCount };
    } catch (error) {
      console.error('Error fetching data:', error);
      return { countries: [], totalCount: 0 };
    }
  }

  private renderCountryCard(country: Country): HTMLDivElement {
    const countryCard = document.createElement('div');
    countryCard.classList.add('country-card');
    countryCard.innerHTML = `
          <h3>${country.name}</h3>
          <p>Capital: ${country.capital}</p>
          <p>Region: ${country.region}</p>
          <p>Code: ${country.code}</p>
          <p>Currency: ${country.currency.name} (${country.currency.code})</p>
          <p>Language: ${country.language.name} (${country.language.code})</p>
          <p>Dialling Code: ${country.dialling_code}</p>
          <p>ISO Code: ${country.isoCode}</p>
        `;
    return countryCard;
  }

  private async renderCountries(): Promise<void> {
    const { countries, totalCount } = await this.fetchData();
    this.totalPages = Math.ceil(totalCount / 20);

    this.countriesContainer.innerHTML = '';
    countries.forEach((country) => {
      const countryCard = this.renderCountryCard(country);
      this.countriesContainer.appendChild(countryCard);
    });

    this.renderPagination();
  }

  private renderPagination(): void {
    this.paginationContainer.innerHTML = '';

    for (let i = 1; i <= this.totalPages; i++) {
      const pageNumber = document.createElement('div');
      pageNumber.classList.add('page-number');
      pageNumber.innerText = i.toString();
      pageNumber.addEventListener('click', () => this.goToPage(i));

      if (i === this.page) {
        pageNumber.classList.add('active');
      }

      this.paginationContainer.appendChild(pageNumber);
    }
  }

  private async goToPage(selectedPage: number): Promise<void> {
    this.page = selectedPage;
    await this.renderCountries();
  }
}

document.addEventListener('DOMContentLoaded', () => {
  const countriesPage = new CountriesPage();
});
