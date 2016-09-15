using AmazonProducts.Models;
using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Net;
using System.Security.Cryptography;
using System.Text;
using System.Threading.Tasks;
using System.Xml.Linq;

namespace AmazonProducts.Utilities
{
    /// <summary>
    /// Represents Amazon Product API utilities.
    /// </summary>
    public class AmazonApiHelper : IDisposable
    {
        #region Constants

        /// <summary>
        /// Amazon api end point.
        /// </summary>
        private const string EndPoint = "webservices.amazon.com";
        /// <summary>
        /// Amazon request uri
        /// </summary>
        private const string RequestUri = "/onca/xml";

        /// <summary>
        /// Type of service.
        /// </summary>
        private const string qsService = "AWSECommerceService";
        /// <summary>
        /// Request operation.
        /// </summary>
        private const string qsOperation = "ItemSearch";
        /// <summary>
        /// Request search index (category).
        /// </summary>
        private const string qsSearchIndex = "All";
        /// <summary>
        /// Request response group.
        /// </summary>
        private const string qsResponseGroup = "Images,ItemAttributes,Offers";

        /// <summary>
        /// Request query template.
        /// </summary>
        private const string canonicalQsFormatTemplate = "AWSAccessKeyId={2}&AssociateTag={3}&ItemPage={8}&Keywords={5}&Operation={1}&ResponseGroup={6}&SearchIndex={4}&Service={0}&Timestamp={7}";

        /// <summary>
        /// Date format.
        /// </summary>
        private const string dateFormat = "yyyy-MM-ddTHH:mm:ss.000Z";
        /// <summary>
        /// String to sign template.
        /// </summary>
        private const string stringToSignFormat = "GET\n{0}\n{1}\n{2}";
        /// <summary>
        /// Final request query template.
        /// </summary>
        private const string signedUriFormat = "http://{0}{1}?{2}&Signature={3}";

        #endregion

        #region Fields

        /// <summary>
        /// Hash-based Message Authentication Code (HMAC) by using the SHA256 hash function.
        /// </summary>
        private HMACSHA256 _hmac = null;

        /// <summary>
        /// Amazon secret access key.
        /// </summary>
        private string _awsSecretKey = null;

        /// <summary>
        /// Amazon access key id.
        /// </summary>
        private string _awsAccessKeyId = null;

        /// <summary>
        /// Amazon associate tag.
        /// </summary>
        private string _associateTag = null;

        #endregion

        #region Properties

        /// <summary>
        /// Amazon secret access key.
        /// </summary>
        public string AwsSecretKey { get { return _awsSecretKey; } }

        /// <summary>
        /// Amazon access key id.
        /// </summary>
        public string AwsAccessKeyId { get { return _awsAccessKeyId; } }

        /// <summary>
        /// Amazon associate tag.
        /// </summary>
        public string AssociateTag { get { return _associateTag; } }

        #endregion

        #region .ctor

        /// <summary>
        /// Instantiates <see cref="AmazonApiHelper"/> Amazon Product API utilities.
        /// </summary>
        /// <param name="associateTag">Amazon associate tag.</param>
        /// <param name="awsAccessKeyId">Amazon access key id.</param>
        /// <param name="awsSecretKey">Amazon secret access key.</param>
        public AmazonApiHelper(string associateTag, string awsAccessKeyId, string awsSecretKey)
        {
            _associateTag = associateTag;
            _awsAccessKeyId = awsAccessKeyId;
            _awsSecretKey = awsSecretKey;
        }

        #endregion

        #region Methods

        /// <summary>
        /// Returns request uri for given keywords and page.
        /// </summary>
        /// <param name="keywords">Keywords to search.</param>
        /// <param name="page">Result page.</param>
        /// <returns><see cref="string"/> uri.</returns>
        public string GetRequestUri(string keywords, int page = 1)
        {
            string qsKeywords = WebUtility.UrlEncode(keywords);
            string qsTimestamp = DateTime.UtcNow.ToString(dateFormat).Replace(":", "%3A");

            string canonicalQs = string.Format(canonicalQsFormatTemplate,
                                    qsService,
                                    qsOperation,
                                    _awsAccessKeyId,
                                    _associateTag,
                                    qsSearchIndex,
                                    qsKeywords,
                                    qsResponseGroup.Replace(",", "%2C"),
                                    qsTimestamp,
                                    page);

            string stringToSign = string.Format(stringToSignFormat, EndPoint, RequestUri, canonicalQs);

            byte[] hashedSecretString = HmacSha256(stringToSign, _awsSecretKey);
            string qsSignature = Convert.ToBase64String(hashedSecretString).Replace("+", "%2B").Replace("=", "%3D");

            string signedUri = string.Format(signedUriFormat, EndPoint, RequestUri, canonicalQs, qsSignature);
            return signedUri;
        }

        /// <summary>
        /// Executes web request with given uri and keywords in async way.
        /// </summary>
        /// <param name="uri">Uri for a request.</param>
        /// <param name="keywords">Keywords to include in a response.</param>
        /// <returns><see cref="string"/> json value.</returns>
        public async Task<AmazonResponse> ExecuteWebRequestAsync(string uri, string keywords)
        {
            AmazonResponse responseJson = null;

            var webRequest = WebRequest.CreateHttp(uri);
            using (var webResponse = await webRequest.GetResponseAsync() as HttpWebResponse)
            using (var dataStream = webResponse.GetResponseStream())
            using (var reader = new StreamReader(dataStream))
            {
                string responseFromServer = reader.ReadToEnd();
                responseJson = GetWebResponse(keywords, responseFromServer, webResponse);
            }

            return responseJson;
        }

        #endregion

        #region Utilities

        /// <summary>
        /// Returns xml value.
        /// </summary>
        /// <param name="el">Xml element.</param>
        /// <param name="elNames">Element names.</param>
        /// <returns><see cref="string"/> value of element.</returns>
        private string GetXmlValue(XElement el, params string[] elNames)
        {
            if (el == null)
                return null;
            if (elNames == null || elNames.Length < 1)
                return el.Value;

            var currentNode = el;
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

        /// <summary>
        /// Returns <see cref="AmazonResponse"/> response from Amazon.
        /// </summary>
        /// <param name="keywords">Keywords to include to response.</param>
        /// <param name="responseFromServer">Stringified xml response from Amazon.</param>
        /// <param name="webResponse"><see cref="HttpWebResponse"/> response.</param>
        /// <returns><see cref="AmazonResponse"/> result.</returns>
        private AmazonResponse GetWebResponse(string keywords, string responseFromServer, HttpWebResponse webResponse)
        {
            var xmlDoc = XDocument.Parse(responseFromServer);
            var itemsEl = xmlDoc.Descendants().First(d => d.Name.LocalName == "Items");
            var itemEls = itemsEl.Elements().Where(e => e.Name.LocalName == "Item");

            var items = itemEls.Select(i => new AmazonProduct
            {
                asin = GetXmlValue(i, "ASIN"),
                productUrl = GetXmlValue(i, "DetailPageURL"),
                productImgUrl = GetXmlValue(i, "MediumImage", "URL") ?? GetXmlValue(i.Descendants().FirstOrDefault(e => e.Name.LocalName == "MediumImage"), "URL"),
                title = GetXmlValue(i, "ItemAttributes", "Title"),
                price = GetXmlValue(i, "OfferSummary", "LowestNewPrice", "FormattedPrice"),
                offersUrl = GetXmlValue(i, "Offers", "MoreOffersUrl")
            }).ToList();

            return new AmazonResponse
            {
                keywords = keywords,
                responseArray = items,
                statusDescription = webResponse.StatusDescription,
                statusCode = webResponse.StatusCode.ToString(),
                isError = webResponse.StatusCode != HttpStatusCode.OK,
                isFromCache = false
            };
        }

        /// <summary>
        /// Returns <see cref="AmazonResponse"/> empty response.
        /// </summary>
        /// <param name="keywords">Keywords to include to response.</param>
        /// <param name="message">Status message.</param>
        /// <param name="code">Http status.</param>
        /// <returns><see cref="AmazonResponse"/> result.</returns>
        public static AmazonResponse GetEmptyResponse(string keywords, string message, HttpStatusCode code)
        {
            return new AmazonResponse
            {
                keywords = keywords,
                responseArray = new List<AmazonProduct>(),
                statusDescription = message,
                statusCode = code.ToString(),
                isError = code != HttpStatusCode.OK,
                isFromCache = false
            };
        }

        /// <summary>
        /// Returns encoded data with Hash-based Message Authentication Code (HMAC) by using the SHA256 hash function.
        /// </summary>
        /// <param name="data">Data to encode.</param>
        /// <param name="key">Key for encoding.</param>
        /// <returns><see cref="byte[]"/> result.</returns>
        private byte[] HmacSha256(string data, string key)
        {
            if (_hmac == null)
            {
                _hmac = new HMACSHA256(Encoding.UTF8.GetBytes(key));
            }
            return _hmac.ComputeHash(Encoding.UTF8.GetBytes(data));
        }

        #endregion

        #region IDisposable

        private bool _disposing = false;

        protected virtual void Dispose(bool disposing)
        {
            if (!_disposing)
            {
                _hmac.Dispose();
                _disposing = true;
            }
        }

        public void Dispose()
        {
            Dispose(true);
        }
        
        #endregion
    }
}
