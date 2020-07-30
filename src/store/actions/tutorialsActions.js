import * as actions from "./actionTypes";
import Elasticlunr from "../../helpers/elasticlunr";

const tutorials_index = new Elasticlunr(
  "tutorial_id",
  "owner",
  "tutorial_id",
  "title",
  "summary"
);

export const searchFromTutorialsIndex = query => {
  return tutorials_index.searchFromIndex(query);
};

export const getUserTutorialsBasicData = user_handle => async (
  firestore,
  dispatch
) => {
  try {
    dispatch({ type: actions.GET_USER_TUTORIALS_BASIC_START });
    let index;
    const querySnapshot = await firestore
      .collection("cl_codelabz")
      .doc("user")
      .collection(user_handle)
      .get();

    if (querySnapshot.empty) {
      index = [];
    } else {
      index = querySnapshot.docs.map(doc => {
        const new_doc = {
          owner: user_handle,
          tutorial_id: doc.id,
          title: doc.get("title") || "",
          summary: doc.get("summary") || "",
          featured_image: doc.get("featured_image") || "",
          icon: doc.get("icon") || ""
        };

        tutorials_index.addDocToIndex(new_doc);
        return new_doc;
      });
    }
    dispatch({
      type: actions.GET_USER_TUTORIALS_BASIC_SUCCESS,
      payload: index
    });
  } catch (e) {
    dispatch({
      type: actions.GET_USER_TUTORIALS_BASIC_FAIL,
      payload: e.message
    });
  }
};

export const getOrgTutorialsBasicData = organizations => async (
  firestore,
  dispatch
) => {
  try {
    dispatch({ type: actions.GET_ORG_TUTORIALS_BASIC_START });
    let index = [];

    const getFinalData = async handle => {
      let temp_array;
      const querySnapshot = await firestore
        .collection("cl_codelabz")
        .doc("organization")
        .collection(handle)
        .get();

      if (querySnapshot.empty) {
        temp_array = [];
      } else {
        temp_array = querySnapshot.docs.map(doc => {
          const new_doc = {
            owner: handle,
            tutorial_id: doc.id,
            title: doc.get("title") || "",
            summary: doc.get("summary") || "",
            featured_image: doc.get("featured_image") || "",
            icon: doc.get("icon") || ""
          };
          tutorials_index.addDocToIndex(new_doc);
          return new_doc;
        });
      }

      return temp_array;
    };

    if (organizations.length > 0) {
      const promises = organizations.map(
        async org_handle => await getFinalData(org_handle)
      );

      index = await Promise.all(promises);
    }

    dispatch({
      type: actions.GET_ORG_TUTORIALS_BASIC_SUCCESS,
      payload: index.flat()
    });
  } catch (e) {
    dispatch({
      type: actions.GET_ORG_TUTORIALS_BASIC_FAIL,
      payload: e.message
    });
  }
};

export const clearTutorialsBasicData = () => dispatch =>
  dispatch({ type: actions.CLEAR_TUTORIALS_BASIC_STATE });
