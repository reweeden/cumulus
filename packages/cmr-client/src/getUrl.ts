const getHostname = (cmrHost?: string, cmrEnvironment?: string): string => {
  if (cmrHost) return cmrHost;

  switch (cmrEnvironment) {
    case 'OPS':
      return 'cmr.earthdata.nasa.gov';
    case 'UAT':
      return 'cmr.uat.earthdata.nasa.gov';
    case 'SIT':
      return 'cmr.sit.earthdata.nasa.gov';
    default:
      throw new TypeError('Unable to determine CMR hostname');
  }
};

export const getProviderUrl = (params: {
  cmrProvider: string,
  cmrHost?: string,
  cmrEnvironment?: string
}): string => {
  const hostname = getHostname(params.cmrHost, params.cmrEnvironment);

  return `https://${hostname}/ingest/providers/${params.cmrProvider}/`;
};

export const getSearchUrl = (params: {
  cmrHost?: string,
  cmrEnvironment?: string
}): string => {
  const hostname = getHostname(params.cmrHost, params.cmrEnvironment);

  return `https://${hostname}/search/`;
};

export const getTokenUrl = (cmrEnv: string): string => {
  if (cmrEnv === 'OPS') {
    return 'https://cmr.earthdata.nasa.gov/legacy-services/rest/tokens';
  }

  return 'https://cmr.uat.earthdata.nasa.gov/legacy-services/rest/tokens';
};

export const getValidateUrl = (params: {
  cmrProvider: string,
  cmrHost?: string,
  cmrEnvironment?: string
}): string => `${getProviderUrl(params)}validate/`;
