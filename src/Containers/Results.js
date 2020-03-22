import React, { useCallback, useEffect, useState } from "react";
import { YouTubeAPI } from "../Components/api/YoutubeApi";
import "./SCSS/Results.scss";
import { FilterIcon } from "./ICON";
import {
  RippleButton,
  ResultVideoContainer,
  ResultChannelContainer,
  ResultPlaylistContainer,
  Filter
} from "../Components";
import { useParams } from "react-router";
import { ResultSkeleton, MessageBox } from "../Components";

let SearchArray = [];

const Results = React.memo(() => {
  // Get Route Param
  let { id } = useParams();

  // Loading State
  const [isLoading, setIsLoading] = useState(true);

  // API Collector State
  const [SearchResult, setSearchResult] = useState([]);

  // ==================
  // Filter drop state
  // ==================

  const [ShowFilterDrop, setShowFilterDrop] = useState(false);

  const [FilterState, setFilterState] = useState();

  // Message Error State
  const [
    { show, message, btnMessage, isError },
    setShowErrorMessage
  ] = useState({
    show: false,
    message: "",
    btnMessage: "",
    isError: false
  });

  // ===========================
  //           SEARCH
  // ===========================
  const SearchRequest = async (parameter = false, option = false) => {
    setIsLoading(true);
    YouTubeAPI.get("search", {
      params:
        parameter && option
          ? {
              part: "snippet",
              maxResults: 5,
              q: id,
              key: process.env.REACT_APP_YOUTUBE_API_KEY,
              [parameter]: option
            }
          : {
              part: "snippet",
              maxResults: 5,
              q: id,
              key: process.env.REACT_APP_YOUTUBE_API_KEY
            }
    })
      .then(res => {
        res.data.items.map(res => {
          //console.log("object :", res);
          return (SearchArray = [
            ...SearchArray,
            {
              thumbnail:
                "maxres" in res.snippet.thumbnails
                  ? res.snippet.thumbnails.maxres.url
                  : res.snippet.thumbnails.medium.url,
              channelTitle: res.snippet.channelTitle,
              channelId: res.snippet.channelId,
              videoId: res.id.kind === "youtube#video" ? res.id.videoId : false,
              playlistId:
                res.id.kind === "youtube#playlist" ? res.id.playlistId : false,
              publishedAt: res.snippet.publishedAt,
              title: res.snippet.title,
              description: res.snippet.description
            }
          ]);
        });

        setSearchResult([...SearchArray], setIsLoading(false));
        SearchArray = [];
        if (ShowFilterDrop) {
          setShowFilterDrop(false);
        }
      })
      .catch(err => {
        // Error Setup
        setShowErrorMessage({
          show: true,
          message: `${err}`,
          btnMessage: "dismiss",
          isError: true
        });
        setIsLoading(true);
      });
  };

  useEffect(() => {
    if (FilterState !== undefined) {
      SearchRequest(
        Object.keys(FilterState)[0],
        FilterState[Object.keys(FilterState)[0]]
      );
    } else {
      SearchRequest();
    }
  }, [id, FilterState]);

  const handleFilterClick = useCallback(() => {
    setShowFilterDrop(!ShowFilterDrop);
  }, [ShowFilterDrop]);

  // ====================================
  //           Error Handling
  // ====================================

  const HandleClosingMessageBox = useCallback(() => {
    // Just to make sure isError will not
    // change to false by any chance before doing some logic if true
    try {
      if (isError) {
      }
    } finally {
      setShowErrorMessage(pre => {
        return {
          show: false,
          message: pre.message,
          btnMessage: pre.btnMessage,
          isError: false
        };
      });
    }
  }, [isError]);

  const HandleShowMessageBox = useCallback(
    (watchLater, ch = false) => {
      if (!ch) {
        setShowErrorMessage({
          show: true,
          message: !watchLater
            ? "Saved to Watch later"
            : "Removed from Watch later",
          btnMessage: "UNDO",
          isError: false
        });
      } else {
        setShowErrorMessage({
          show: true,
          message: "sub",
          btnMessage: "UNDO",
          isError: false
        });
      }

      setTimeout(() => {
        HandleClosingMessageBox();
      }, 4000);
    },
    [HandleClosingMessageBox]
  );

  //console.log("=====<> Results page");
  return (
    <div id="hvc" className="results_container">
      <div className="results_contentwrapper">
        {/* FILTER AREA */}
        <RippleButton onclick={handleFilterClick} classname="header_container">
          <div className="header_wrapper">
            <div className="header_icon">
              <FilterIcon />
            </div>
            <span className="header_text">filter</span>
          </div>
        </RippleButton>

        <Filter
          ShowFilterDrop={ShowFilterDrop}
          setFilterState={setFilterState}
        />

        {/* END FILTER AREA */}
        <div className="r_line"></div>
        <div className="results_section_list">
          {SearchResult.map((item, index) => {
            //console.log("---->", item.videoId, item.playlistId);
            return item.videoId ? (
              <ResultVideoContainer
                key={index}
                index={index}
                item={item}
                HandleShowMessageBox={HandleShowMessageBox}
              />
            ) : !item.playlistId ? (
              <ResultChannelContainer
                key={index}
                index={index}
                item={item}
                HandleShowMessageBox={HandleShowMessageBox}
              />
            ) : (
              <ResultPlaylistContainer key={index} index={index} item={item} />
            );
          })}
        </div>
      </div>
      <MessageBox
        message={message}
        btnMessage={btnMessage}
        show={show}
        HandleMessageBtn={HandleClosingMessageBox}
      />
    </div>
  );
});

export default Results;