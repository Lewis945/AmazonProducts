using AmazonProducts.Configuration;
using AmazonProducts.Models;
using AmazonProducts.Utilities;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Options;
using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Threading.Tasks;

namespace AmazonProducts.Controllers
{
    [Route("api/[controller]")]
    public class AmazonProductsController : Controller
    {
        #region Fields

        private AppSettings _setting;
        private CurrencyHelper _currencyHelper;

        #endregion

        #region .ctor

        public AmazonProductsController(IOptions<AppSettings> settings, CurrencyHelper currencyHelper)
        {
            _setting = settings.Value;
            _currencyHelper = currencyHelper;
        }

        #endregion

        #region Actions

        [HttpGet("[action]")]
        public async Task<AmazonResponse> Products(string keywords, string currency, int startDateIndex = 0)
        {
            string associateTag = _setting.AssociateTag;
            string awsAccessKeyId = _setting.AccessKeyId;
            string awsSecretKey = _setting.SecretAccessKey;

            string responseJson = string.Empty;

            if (string.IsNullOrEmpty(keywords))
            {
                responseJson = AmazonApiHelper.GetEmptyResponseJson(string.Empty, string.Empty, HttpStatusCode.OK);
            }
            else
            {
                using (var apiHelper = new AmazonApiHelper(associateTag, awsAccessKeyId, awsSecretKey))
                {
                    string requestUri = apiHelper.GetRequestUri(keywords);
                    try
                    {
                        responseJson = await apiHelper.ExecuteWebRequest(requestUri, keywords);
                    }
                    catch (Exception ex)
                    {
                        responseJson = AmazonApiHelper.GetEmptyResponseJson(keywords, ex.Message, HttpStatusCode.InternalServerError);
                    }
                }
            }

            var response = JsonConvert.DeserializeObject<AmazonResponse>(responseJson);

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
