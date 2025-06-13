import { Provider, defaultTheme } from '@adobe/react-spectrum';

const ThemeProvider = (Component) => (props) => (
  <Provider theme={defaultTheme} colorScheme="light">
    <Component {...props} />
  </Provider>
);

export default ThemeProvider;
