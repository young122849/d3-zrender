const loadResource = requireContext => requireContext.keys().map(requireContext);
const resources = require.context('../assets/icons/', false, /\.svg$/)
loadResource(resources);