namespace AmazonProducts.Models
{
    /// <summary>
    /// Represents product retrieved from Amazon.
    /// </summary>
    public class AmazonProduct
    {
        /// <summary>
        /// ASIN(id) of a product.
        /// </summary>
        public string asin { get; set; }
        /// <summary>
        /// Url of a product.
        /// </summary>
        public string productUrl { get; set; }
        /// <summary>
        /// Url of a product's image.
        /// </summary>
        public string productImgUrl { get; set; }
        /// <summary>
        /// Title of a product.
        /// </summary>
        public string title { get; set; }
        /// <summary>
        /// Price of a product with a currency sign.
        /// </summary>
        public string price { get; set; }
        /// <summary>
        /// Url to a list of offers on amazon.
        /// </summary>
        public string offersUrl { get; set; }
    }
}
