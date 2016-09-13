using System;
using System.IO;
using System.Linq;
using System.Net;
using System.Security.Cryptography;
using System.Text;
using System.Threading.Tasks;
using System.Xml.Linq;
using Newtonsoft.Json;

namespace AmazonProducts.Utilities
{
    public class AmazonApiHelper : IDisposable
    {
        #region Constants
        private const string EndPoint = "webservices.amazon.com";
        private const string RequestUri = "/onca/xml";

        private const string qsService = "AWSECommerceService";
        private const string qsOperation = "ItemSearch";
        private const string qsSearchIndex = "All";
        private const string qsResponseGroup = "Images,ItemAttributes,Offers";

        private const string canonicalQsFormat = "AWSAccessKeyId={2}&AssociateTag={3}&ItemPage={8}&Keywords={5}&Operation={1}&ResponseGroup={6}&SearchIndex={4}&Service={0}&Timestamp={7}";

        private const string dateFormat = "yyyy-MM-ddTHH:mm:ss.000Z";
        private const string stringToSignFormat = "GET\n{0}\n{1}\n{2}";
        private const string signedUriFormat = "http://{0}{1}?{2}&Signature={3}";
        #endregion

        private HMACSHA256 hmac = null;

        public string AwsSecretKey { get; private set; }
        public string AwsAccessKeyId { get; private set; }
        public string AssociateTag { get; private set; }

        public AmazonApiHelper(string associateTag, string awsAccessKeyId, string awsSecretKey)
        {
            AssociateTag = associateTag;
            AwsAccessKeyId = awsAccessKeyId;
            AwsSecretKey = awsSecretKey;
        }

        public string GetRequestUri(string keywords, int page = 1)
        {
            string qsKeywords = System.Net.WebUtility.UrlEncode(keywords);
            //string qsKeywords = HttpUtility.UrlPathEncode(keywords);
            string qsTimestamp = DateTime.UtcNow.ToString(dateFormat).Replace(":", "%3A");

            string canonicalQs = string.Format(canonicalQsFormat,
                                    qsService,
                                    qsOperation,
                                    AwsAccessKeyId,
                                    AssociateTag,
                                    qsSearchIndex,
                                    qsKeywords,
                                    qsResponseGroup.Replace(",", "%2C"),
                                    qsTimestamp,
                                    page);

            string stringToSign = string.Format(stringToSignFormat, EndPoint, RequestUri, canonicalQs);

            byte[] hashedSecretString = hmacSHA256(stringToSign, AwsSecretKey);
            string qsSignature = Convert.ToBase64String(hashedSecretString).Replace("+", "%2B").Replace("=", "%3D");

            string signedUri = string.Format(signedUriFormat, EndPoint, RequestUri, canonicalQs, qsSignature);
            return signedUri;
        }

        public async Task<string> ExecuteWebRequest(string uri, string keywords)
        {
            string responseJson = null;

            WebRequest webRequest = WebRequest.CreateHttp(uri);
            using (HttpWebResponse webResponse = await webRequest.GetResponseAsync() as HttpWebResponse)
            using (Stream dataStream = webResponse.GetResponseStream())
            using (StreamReader reader = new StreamReader(dataStream))
            {
                string responseFromServer = reader.ReadToEnd();
                responseJson = GetWebResponseJson(uri, keywords, responseFromServer, webResponse);
            }

            return responseJson;
        }

        #region Utilities
        private string GetXmlValue(XElement el, params string[] elNames)
        {
            if (el == null)
            {
                return null;
            }
            if (elNames == null || elNames.Length < 1)
            {
                return el.Value;
            }
            XElement currentNode = el;
            foreach (string elName in elNames)
            {
                currentNode = currentNode.Elements().FirstOrDefault(e => e.Name.LocalName == elName);
                if (currentNode == null)
                {
                    // Path is not valid
                    return null;
                }
            }
            string valueOfFinalEl = currentNode.Value;
            return valueOfFinalEl;
        }

        private string GetWebResponseJson(string requestUri, string keywords, string responseFromServer, HttpWebResponse webResponse)
        {
            var xmlDoc = XDocument.Parse(responseFromServer);
            var itemsEl = xmlDoc.Descendants().First(d => d.Name.LocalName == "Items");
            var itemEls = itemsEl.Elements().Where(e => e.Name.LocalName == "Item");

            var items = itemEls.Select(i => new
            {
                asin = GetXmlValue(i, "ASIN"),
                productUrl = GetXmlValue(i, "DetailPageURL"),
                productImgUrl = GetXmlValue(i, "MediumImage", "URL") ?? GetXmlValue(i.Descendants().FirstOrDefault(e => e.Name.LocalName == "MediumImage"), "URL"),
                title = GetXmlValue(i, "ItemAttributes", "Title"),
                price = GetXmlValue(i, "OfferSummary", "LowestNewPrice", "FormattedPrice"),
                offersUrl = GetXmlValue(i, "Offers", "MoreOffersUrl")
            });

            var json = JsonConvert.SerializeObject(new
            {
                keywords = keywords,
                // requestUri = requestUri,
                responseArray = items,
                statusDescription = webResponse.StatusDescription,
                statusCode = webResponse.StatusCode.ToString(),
                isError = webResponse.StatusCode != HttpStatusCode.OK,
                isFromCache = false
            });
            return json;
        }

        public static string GetEmptyResponseJson(string keywords, string message, HttpStatusCode code)
        {
            var json = JsonConvert.SerializeObject(new
            {
                keywords = keywords,
                // requestUri = requestUri,
                responseArray = new object[0],
                statusDescription = message,
                statusCode = code.ToString(),
                isError = code != HttpStatusCode.OK,
                isFromCache = false
            });
            return json;
        }

        private byte[] hmacSHA256(string data, string key)
        {
            if (hmac == null)
            {
                hmac = new HMACSHA256(Encoding.UTF8.GetBytes(key));
            }
            return hmac.ComputeHash(Encoding.UTF8.GetBytes(data));
        }
        #endregion

        #region IDisposable Support
        private bool disposedValue = false;

        protected virtual void Dispose(bool disposing)
        {
            if (!disposedValue)
            {
                hmac.Dispose();
                disposedValue = true;
            }
        }

        public void Dispose()
        {
            Dispose(true);
        }
        #endregion
    }
}