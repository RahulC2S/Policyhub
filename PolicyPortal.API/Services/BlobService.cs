using Azure.Storage.Blobs;
using Azure.Storage.Sas;

namespace PolicyPortal.API.Services
{
    public class BlobService
    {
        private readonly string _connectionString;

        public BlobService(IConfiguration configuration)
        {
            _connectionString =
                configuration.GetConnectionString("AzureBlobStorage");
        }

        public string GenerateSasToken(string blobUrl)
        {
            var uri = new Uri(blobUrl);

            var fileName = Path.GetFileName(uri.LocalPath);

            var containerClient = new BlobContainerClient(
                _connectionString,
                "policy"
            );

            var blobClient = containerClient.GetBlobClient(fileName);

            var sasBuilder = new BlobSasBuilder
            {
                BlobContainerName = "policy",
                BlobName = fileName,
                Resource = "b",
                ExpiresOn = DateTimeOffset.UtcNow.AddHours(1)
            };

            sasBuilder.SetPermissions(BlobSasPermissions.Read);

            return blobClient.GenerateSasUri(sasBuilder).ToString();
        }
    }
}