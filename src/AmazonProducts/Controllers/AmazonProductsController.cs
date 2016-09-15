using AmazonProducts.Configuration;
using AmazonProducts.Models;
using AmazonProducts.Utilities;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Options;
using Newtonsoft.Json;
using System;
using System.Net;
using System.Threading.Tasks;

namespace AmazonProducts.Controllers
{
    /// <summary>
    /// Controller responsible for amazon products obtaining.
    /// </summary>
    [Route("api/[controller]")]
    public class AmazonProductsController : Controller
    {
        #region Fields

        /// <summary>
        /// Contains setting from Configuration (Startup.cs)
        /// </summary>
        private AppSettings _setting;

        /// <summary>
        /// Holds <see cref="CurrencyHelper"/> that contains method for currency conversion.
        /// </summary>
        private CurrencyHelper _currencyHelper;

        #endregion

        #region .ctor

        /// <summary>
        /// Instantiates <see cref="AmazonProductsController"/> controller and embedes <see cref="AppSettings"/> and <see cref="CurrencyHelper"/> to it with DependencyInjection.
        /// </summary>
        /// <param name="settings">Setting from Configuration (Startup.cs)</param>
        /// <param name="currencyHelper">Contains method for currency conversion</param>
        public AmazonProductsController(IOptions<AppSettings> settings, CurrencyHelper currencyHelper)
        {
            _setting = settings.Value;
            _currencyHelper = currencyHelper;
        }

        #endregion

        #region Actions

        /// <summary>
        /// Returns list of amazon products with Amazon Product API wrapped in <see cref="AmazonResponse"/>.
        /// </summary>
        /// <param name="keywords">Keywords seperated by comma.</param>
        /// <param name="currency"><see cref="string"/> representation of <see cref="Currency"/> enum value.</param>
        /// <param name="page"><see cref="int"/> page value.</param>
        /// <returns><see cref="AmazonResponse"/> result.</returns>
        [HttpGet("[action]")]
        public async Task<AmazonResponse> Products(string keywords, string currency = "USD", int page = 1)
        {
            string associateTag = _setting.AssociateTag;
            string awsAccessKeyId = _setting.AccessKeyId;
            string awsSecretKey = _setting.SecretAccessKey;

            AmazonResponse response;

            if (string.IsNullOrEmpty(keywords))
            {
                response = AmazonApiHelper.GetEmptyResponse(string.Empty, string.Empty, HttpStatusCode.OK);
            }
            else
            {
                using (var apiHelper = new AmazonApiHelper(associateTag, awsAccessKeyId, awsSecretKey))
                {
                    string requestUri = apiHelper.GetRequestUri(keywords, page);
                    try
                    {
                        response = await apiHelper.ExecuteWebRequestAsync(requestUri, keywords);
                    }
                    catch (Exception ex)
                    {
                        response = AmazonApiHelper.GetEmptyResponse(keywords, ex.Message, HttpStatusCode.InternalServerError);
                    }
                }
            }

            var currencyValue = Currency.USD;
            Enum.TryParse(currency, out currencyValue);
            foreach (var product in response.responseArray)
            {
                if (product.price != null)
                {
                    string priceString = product.price.Remove(0, 1);
                    decimal price = 0;
                    decimal.TryParse(priceString, out price);

                    price = await _currencyHelper.CurrencyConversionAsync(price, Currency.USD, currencyValue);
                    price = Math.Round(price, 2);
                    product.price = $"{price} {currencyValue.ToString()}";
                }
            }

            return response;
        }

        #endregion
    }
}
