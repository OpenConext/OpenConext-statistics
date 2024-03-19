import {library, config} from '@fortawesome/fontawesome-svg-core'

// Make sure FontAwesome doesn't use inline CSS styles
// see https://fontawesome.com/docs/web/dig-deeper/security#content-security-policy
// Make sure this is before any other `fontawesome` API calls
config.autoAddCss = false;
import "../../node_modules/@fortawesome/fontawesome-svg-core/styles.css";

import {
faDownload, faCopy
} from '@fortawesome/free-solid-svg-icons'

export function addIcons() {
    library.add(
        faDownload,
        faCopy
    );
}
