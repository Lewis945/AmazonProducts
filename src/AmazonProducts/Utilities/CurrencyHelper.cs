using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Net;
using System.Threading.Tasks;

namespace AmazonProducts.Utilities
{
    public class CurrencyHelper
    {
        public CurrencyHelper()
        {

        }

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
    }
}
