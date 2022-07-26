import html from '../../lib/html.js'
import { useCallback } from '../../deps/preact/hooks.js'

import { fetchStates } from '../../lib/hooks/use-fetch.js'

import { vehicleTypes } from './vehicle-types.js'

const GPXConverter = ({
  onSubmit,
  requestData,
  setRequestData,
  submitAllowed,
  state,
  googleMapsUrls,
  mapImageUrls,
}) => {
  const onChange = useCallback(
    (e) => {
      switch (e.target.name) {
        case 'vehicle_type':
          return setRequestData({ ...requestData, vehicle_type: e.target.value })
        case 'max_precision':
          let value = parseInt(e.target.value)
          const [min, max] = [e.target.min, e.target.max].map((v) => parseInt(v))
          if (value > max) {
            value = max
          } else if (value < min) {
            value = min
          }

          return setRequestData({ ...requestData, max_precision: value.toString() })
        case 'gpx_file':
          return setRequestData({ ...requestData, gpx: e.target.files[0] })
        default:
          console.warn('unknown target', { name: e.target.name, event: e })
          break
      }
    },
    [requestData, setRequestData]
  )

  return html`
    <div class="gpx-converter">
      <div class="grid">
        <aside>
          <form onsubmit=${onSubmit}>
            <label for="vehicle_type">Vehicle type</label>
            <select
              name="vehicle_type"
              value=${requestData.vehicle_type}
              id="vehicle_type"
              onchange=${onChange}
            >
              ${vehicleTypes.map(({ name, value }) => html`<option value=${value}>${name}</option>`)}
            </select>
            <label for="max_precision">Max precision</label>
            <input
              type="number"
              min="3"
              max="30"
              name="max_precision"
              value=${requestData.max_precision}
              onchange=${onChange}
            />

            <label for="gpx_file">Select <code>.gpx</code> file</label>
            <input type="file" name="gpx_file" accept=".gpx" onchange=${onChange} />
            <button type="submit" disabled=${!submitAllowed} aria-busy=${state === fetchStates.LOADING}>
              Upload
            </button>
          </form>
        </aside>
        ${googleMapsUrls != null && mapImageUrls != null
          ? html`
              ${googleMapsUrls.map(
                (url, i) => html`
                  <article class="preview-map">
                    <p>Preview of the waypoints that will be used by Google</p>
                    <img
                      alt="Map with a preview of the waypoints that will be used by Google"
                      src=${mapImageUrls[i]}
                    />
                    <h3><a href=${url} target="_blank">Google Maps directions here</a></h3>
                  </article>
                `
              )}
            `
          : null}
      </div>
    </div>
  `
}

export default GPXConverter
