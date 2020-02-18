import { addParameters } from '@storybook/react';
import { INITIAL_VIEWPORTS } from '@storybook/addon-viewport';
// import { DocsPage, DocsContainer } from '@storybook/addon-docs/blocks';
import '!style-loader!css-loader!sass-loader!../assets/scss/main.scss';

addParameters({
  viewport: {
    viewports: INITIAL_VIEWPORTS,
  },
  viewMode: 'docs',
  options: {
    storySort: (a, b) => {
      console.log(a[1].kind, b[1].kind)
      if (b[1].kind.match(/^Overview/)) {
        return 1
      }

      return a[1].kind === b[1].kind ? 0 : a[1].id.localeCompare(b[1].id, undefined, { numeric: true })
    }
  },
});
