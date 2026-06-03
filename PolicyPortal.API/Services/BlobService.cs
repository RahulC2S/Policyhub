using Azure.Storage.Blobs;
using Azure.Storage.Sas;
using Microsoft.AspNetCore.Http;
using System.IO;

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

        public async Task<string> UploadBlobAsync(IFormFile file)
        {
            if (file == null || file.Length == 0)
                throw new ArgumentException("File is required", nameof(file));

            var containerClient = new BlobContainerClient(_connectionString, "policy");
            await containerClient.CreateIfNotExistsAsync();

            var fileName = $"{Guid.NewGuid()}{Path.GetExtension(file.FileName)}";
            var blobClient = containerClient.GetBlobClient(fileName);

            await using var stream = file.OpenReadStream();
            await blobClient.UploadAsync(stream, overwrite: true);

            return blobClient.Uri.ToString();
        }

        public async Task<(Stream Content, string ContentType, string FileName)> DownloadBlobAsync(string blobUrl)
        {
            if (string.IsNullOrEmpty(blobUrl))
                throw new ArgumentException("blobUrl is required", nameof(blobUrl));

            var uri = new Uri(blobUrl, UriKind.RelativeOrAbsolute);
            var fileName = Path.GetFileName(uri.LocalPath);
            BlobClient blobClient;

            if (uri.IsAbsoluteUri && !string.IsNullOrEmpty(uri.Query) && uri.Query.Contains("sig="))
            {
                // If the stored blobUrl already contains a SAS token, use it directly.
                blobClient = new BlobClient(uri);
            }
            else
            {
                // Parse the container and blob path from the URL if available.
                var path = uri.LocalPath.TrimStart('/');
                var segments = path.Split('/');

                if (segments.Length >= 2)
                {
                    var containerName = segments[0];
                    var blobName = string.Join('/', segments.Skip(1));
                    var containerClient = new BlobContainerClient(_connectionString, containerName);
                    blobClient = containerClient.GetBlobClient(blobName);
                }
                else
                {
                    var containerClient = new BlobContainerClient(_connectionString, "policy");
                    blobClient = containerClient.GetBlobClient(fileName);
                }
            }

            if (!await blobClient.ExistsAsync())
            {
                throw new FileNotFoundException($"Blob not found: {blobUrl}");
            }

            var download = await blobClient.DownloadAsync();
            var contentType = download.Value.Details.ContentType ?? "application/pdf";
            var memoryStream = new MemoryStream();
            await download.Value.Content.CopyToAsync(memoryStream);
            memoryStream.Position = 0;
            return (memoryStream, contentType, fileName);
        }
    }
}