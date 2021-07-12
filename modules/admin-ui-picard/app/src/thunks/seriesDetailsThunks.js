import {
    loadSeriesDetailsAclsSuccess,
    loadSeriesDetailsFailure,
    loadSeriesDetailsFeedsSuccess,
    loadSeriesDetailsInProgress,
    loadSeriesDetailsMetadataSuccess, loadSeriesDetailsThemeNamesFailure,
    loadSeriesDetailsThemeNamesInProgress, loadSeriesDetailsThemeNamesSuccess,
    loadSeriesDetailsThemeSuccess
} from "../actions/seriesDetailsActions";
import axios from "axios";
import _ from 'lodash';
import {transformMetadataCollection} from "../utils/resourceUtils";
import {getSeriesDetailsMetadata, getSeriesDetailsThemeNames} from "../selectors/seriesDetailsSelectors";
import {transformToIdValueArray} from "../utils/utils";

// fetch metadata of certain series from server
export const fetchSeriesDetailsMetadata = id => async dispatch => {
    try {
        dispatch(loadSeriesDetailsInProgress());

        // fetch metadata
        let data = await axios.get(`admin-ng/series/${id}/metadata.json`);

        const metadataResponse = await data.data;

        const seriesMetadata = transformMetadataCollection(metadataResponse[0]);

        dispatch(loadSeriesDetailsMetadataSuccess(seriesMetadata));

    } catch (e) {
        dispatch(loadSeriesDetailsFailure());
    }
}

// fetch acls of certain series from server
export const fetchSeriesDetailsAcls = id => async dispatch => {
    try {
        dispatch(loadSeriesDetailsInProgress());

        // fetch acl
        let data = await axios.get(`admin-ng/series/${id}/access.json`);

        const seriesAcls = await data.data;

        dispatch(loadSeriesDetailsAclsSuccess(seriesAcls));

    } catch (e) {
        dispatch(loadSeriesDetailsFailure());
    }
}

// fetch feeds of certain series from server
export const fetchSeriesDetailsFeeds = id => async dispatch => {
    try {
        dispatch(loadSeriesDetailsInProgress());

        // fetch feeds
        let data = await axios.get('admin-ng/feeds/feeds');

        const feedsResponse = await data.data;

        console.log(feedsResponse);

        let seriesFeeds = [];
        for (let i = 0; i < feedsResponse.length; i++) {
            if (feedsResponse[i].name === 'Series') {
                let pattern = feedsResponse[i].identifier.split('/series')[0] + feedsResponse[i].pattern;
                let uidLink = pattern.split('<series_id>')[0] + id;
                let typeLink = uidLink.split('<type>');
                let versionLink = typeLink[1].split('<version>');
                seriesFeeds = [
                    {
                        type: 'atom',
                        version: '0.3',
                        link: typeLink[0] + 'atom' + versionLink[0] + '0.3' + versionLink[1]
                    },
                    {
                        type: 'atom',
                        version: '1.0',
                        link: typeLink[0] + 'atom' + versionLink[0] + '1.0' + versionLink[1]
                    },
                    {
                        type: 'rss',
                        version: '2.0',
                        link: typeLink[0] + 'rss' + versionLink[0] + '2.0' + versionLink[1]
                    }
                ]
            }
        }

        dispatch(loadSeriesDetailsFeedsSuccess(seriesFeeds));

    } catch (e) {
        dispatch(loadSeriesDetailsFailure());
    }
}

// fetch theme of certain series from server
export const fetchSeriesDetailsTheme = id => async dispatch => {
    try {
        dispatch(loadSeriesDetailsInProgress());

        let data = await axios.get(`admin-ng/series/${id}/theme.json`);

        const themeResponse = await data.data;

        let seriesTheme = '';

        // check if series has a theme
        if (!_.isEmpty(themeResponse)) {
            // transform response for further use
            seriesTheme = (transformToIdValueArray(themeResponse))[0].value;
        }

        dispatch(loadSeriesDetailsThemeSuccess(seriesTheme));
    } catch (e) {
        dispatch(loadSeriesDetailsFailure());
    }
}

// fetch names of possible themes from server
export const fetchNamesOfPossibleThemes = () => async dispatch => {
    try {
        dispatch(loadSeriesDetailsThemeNamesInProgress());

        let data = await axios.get('/admin-ng/resources/THEMES.NAME.json');

        const response = await data.data;

        // transform response for further use
        let themeNames = transformToIdValueArray(response);

        dispatch(loadSeriesDetailsThemeNamesSuccess(themeNames));
    } catch (e) {
        dispatch(loadSeriesDetailsThemeNamesFailure());
    }
}

// update series with new metadata
export const updateSeriesMetadata = (id, values) => async (dispatch, getState) => {
    try {
        let metadataInfos = getSeriesDetailsMetadata(getState());

        let fields = [];
        let updatedFields = [];

        metadataInfos.fields.forEach(field => {
            if (field.value !== values[field.id]) {
                let updatedField = {
                    ...field,
                    value: values[field.id]
                }
                updatedFields.push(updatedField);
                fields.push(updatedField);
            } else {
                fields.push({...field});
            }
        });

        let data = new URLSearchParams();
        data.append("metadata",JSON.stringify([{
            flavor: metadataInfos.flavor,
            title: metadataInfos.title,
            fields: updatedFields
        }]));

        await axios.put(`/admin-ng/series/${id}/metadata`, data);

        // updated metadata in series details redux store
        let seriesMetadata = {
            flavor: metadataInfos.flavor,
            title: metadataInfos.title,
            fields: fields
        };
        dispatch(loadSeriesDetailsMetadataSuccess(seriesMetadata));
    } catch (e) {
        console.log(e);
    }
}

export const updateSeriesTheme = (id, values) => async (dispatch, getState) => {
    let themeNames = getSeriesDetailsThemeNames(getState());

    let themeId = themeNames.find(theme => theme.value === values.theme).id;

    let data = new URLSearchParams();
    data.append("themeId", themeId);

    axios.put(`admin-ng/series/${id}/theme`, data)
        .then(response => {
            let themeResponse = response.data;

            let seriesTheme = (transformToIdValueArray(themeResponse))[0].value;

            dispatch(loadSeriesDetailsThemeSuccess(seriesTheme));
        })
        .catch(response => {
            console.log(response);
        });
}
