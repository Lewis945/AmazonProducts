using System.IO;
using System.Net;
using System.Threading.Tasks;

namespace AmazonProducts.Utilities
{
    /// <summary>
    /// Represents currency utilities.
    /// </summary>
    public class CurrencyHelper
    {
        #region .ctor

        /// <summary>
        /// Instantiates currenct helper.
        /// </summary>
        public CurrencyHelper()
        {
        }

        #endregion

        #region Methods

        /// <summary>
        /// Converts price from one currency to another.
        /// </summary>
        /// <param name="amount">Price value.</param>
        /// <param name="fromCurrency"><see cref="Currency"/> value of initial currency.</param>
        /// <param name="toCurrency"><see cref="Currency"/> value of resulting currency.</param>
        /// <returns><see cref="decimal"/> converted value.</returns>
        public async Task<decimal> CurrencyConversionAsync(decimal amount, Currency fromCurrency, Currency toCurrency)
        {
            decimal output = 0;

            // Construct URL to query the Yahoo! Finance API
            const string urlPattern = "http://finance.yahoo.com/d/quotes.csv?s={0}{1}=X&f=l1";
            string url = string.Format(urlPattern, fromCurrency.ToString(), toCurrency.ToString());

            string responseJson = null;

            var webRequest = WebRequest.CreateHttp(url);
            using (var webResponse = await webRequest.GetResponseAsync() as HttpWebResponse)
            using (var dataStream = webResponse.GetResponseStream())
            using (var reader = new StreamReader(dataStream))
            {
                string responseFromServer = reader.ReadToEnd();
                responseJson = responseFromServer;
            }

            // Convert string to number
            decimal exchangeRate = decimal.Parse(responseJson, System.Globalization.CultureInfo.InvariantCulture);

            // Output the result
            output = amount * exchangeRate;

            return output;
        }

        #endregion
    }
}
