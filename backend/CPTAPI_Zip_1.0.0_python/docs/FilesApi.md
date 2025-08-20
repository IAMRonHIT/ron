# openapi_client.FilesApi

All URIs are relative to *https://api-platform.ama-assn.org/cpt-zip/1.0.0*

Method | HTTP request | Description
------------- | ------------- | -------------
[**get_files**](FilesApi.md#get_files) | **GET** /files | Zip archive of the CPT standard distribution data files


# **get_files**
> get_files(release=release)

Zip archive of the CPT standard distribution data files

Provides a temporary download URL to the zip archive of the standard CPT distribution files. By default a URL to the most recent release files is returned.

### Example

* OAuth Authentication (default):
```python
from __future__ import print_function
import time
import openapi_client
from openapi_client.rest import ApiException
from pprint import pprint
configuration = openapi_client.Configuration()
# Configure OAuth2 access token for authorization: default
configuration.access_token = 'YOUR_ACCESS_TOKEN'

# create an instance of the API class
api_instance = openapi_client.FilesApi(openapi_client.ApiClient(configuration))
release = 'release_example' # str | ID of a previous release (i.e. ANNUAL-2023 or PLA-Q2-2022) (optional)

try:
    # Zip archive of the CPT standard distribution data files
    api_instance.get_files(release=release)
except ApiException as e:
    print("Exception when calling FilesApi->get_files: %s\n" % e)
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **release** | **str**| ID of a previous release (i.e. ANNUAL-2023 or PLA-Q2-2022) | [optional] 

### Return type

void (empty response body)

### Authorization

[default](../README.md#default)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/zip

### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
**200** | Successful Response |  -  |
**303** | successful creation of a time-limited download URL |  * Location -  <br>  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

