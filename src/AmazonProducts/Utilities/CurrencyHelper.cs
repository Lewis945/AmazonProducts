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

        public async Task<string> CurrencyConversionAsync(decimal amount, string fromCurrency, string toCurrency)
        {
            string output = "";
            const string fromCurrency1 = "USD";
            const string toCurrency1 = "INR";
            const double amount1 = 2000;

            // Construct URL to query the Yahoo! Finance API
            const string urlPattern = "http://finance.yahoo.com/d/quotes.csv?s={0}{1}=X&f=l1";
            string url = string.Format(urlPattern, fromCurrency1, toCurrency1);

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
            double exchangeRate = double.Parse(responseJson, System.Globalization.CultureInfo.InvariantCulture);

            // Output the result
            output = (amount1 * exchangeRate).ToString();

            return output;
        }
    }
}
