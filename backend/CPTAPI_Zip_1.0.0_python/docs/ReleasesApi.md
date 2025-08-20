# openapi_client.ReleasesApi

All URIs are relative to *https://api-platform.ama-assn.org/cpt-zip/1.0.0*

Method | HTTP request | Description
------------- | ------------- | -------------
[**get_release_date**](ReleasesApi.md#get_release_date) | **GET** /releases | Release data in descending order of date


# **get_release_date**
> list[Release] get_release_date()

Release data in descending order of date

Allows user to query for updates to expose release data in descending order of date

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
api_instance = openapi_client.ReleasesApi(openapi_client.ApiClient(configuration))

try:
    # Release data in descending order of date
    api_response = api_instance.get_release_date()
    pprint(api_response)
except ApiException as e:
    print("Exception when calling ReleasesApi->get_release_date: %s\n" % e)
```

### Parameters
This endpoint does not need any parameter.

### Return type

[**list[Release]**](Release.md)

### Authorization

[default](../README.md#default)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json

### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
**200** | successful operation |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

