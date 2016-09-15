namespace AmazonProducts.Configuration
{
    /// <summary>
    /// Represents application setting for Amazon Product API.
    /// </summary>
    public class AppSettings
    {
        /// <summary>
        /// Amazon associate tag.
        /// </summary>
        public string AssociateTag { get; set; }
        /// <summary>
        /// Amazon access key id.
        /// </summary>
        public string AccessKeyId { get; set; }
        /// <summary>
        /// Amazon secret access key.
        /// </summary>
        public string SecretAccessKey { get; set; }
    }
}
