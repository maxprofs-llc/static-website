// FeatureSelector.js
import React, { useMemo, useState } from "react";

import Modal from "react-materialize/lib/Modal";
import { Button } from "react-materialize";
import Icon from "react-materialize/lib/Icon";
import Col from "react-materialize/lib/Col";
import Preloader from "react-materialize/lib/Preloader";
import Row from "react-materialize/lib/Row";
import FeatureAvailable from "./FeatureAvailable";
import FeatureSelected from "./FeatureSelected";
import TextInput from "../TextInput";

import messages from "../../constants/messages.json";
import TooltipButton from "../TooltipButton";

import "./feature-selector.css";

const FeatureAvailableGroup = ({ category, entities, toggleFeatures }) => {
    return (
        <Row>
            <Col s={12}>
                <h6>{category}</h6>
            </Col>
            {entities.map((feature, i) => (
                <Col s={12} key={i}>
                    <FeatureAvailable
                        feature={feature}
                        toggleFeatures={toggleFeatures}
                    />
                </Col>
            ))}
        </Row>
    );
};

export const FeatureSelectedList = ({ selectedFeatures, onRemoveFeature }) => {
    const selectedFeatureValues = Object.values(selectedFeatures).sort(
        (a, b) => {
            return a.name > b.name ? 1 : -1;
        }
    );

    const sRows = useMemo(
        () =>
            selectedFeatureValues.map((f, idx) => (
                <FeatureSelected
                    key={`${f.name}-${idx}`}
                    feature={f}
                    onRemoveFeature={() => onRemoveFeature(f)}
                />
            )),
        [selectedFeatureValues, onRemoveFeature]
    );

    return (
        <div className="col s12">
            <h6>Included Features ({selectedFeatureValues.length})</h6>
            {sRows}
            <div style={{ height: 100, minHeight: 100 }} />
        </div>
    );
};

export const FeatureSelectorModal = ({
    features,
    selectedFeatures,
    loading,
    onAddFeature,
    onRemoveFeature,
    onRemoveAllFeatures,
    theme = "light",
}) => {
    const [search, setSearch] = useState("");
    const selectedFeatureKeys = Object.keys(selectedFeatures);
    const availableFeatures = useMemo(() => {
        return features.map((feature) => {
            return {
                ...feature,
                selected: selectedFeatureKeys.includes(feature.name),
            };
        });
    }, [features, selectedFeatureKeys]);

    const searchResults = useMemo(() => {
        if (!search.length) {
            return availableFeatures;
        }
        const lcSearch = search.toLowerCase();
        return availableFeatures.filter((feature) => {
            const { name, description, category } = feature;
            return (
                name.toLowerCase().includes(lcSearch) ||
                description.toLowerCase().includes(lcSearch) ||
                category.toLowerCase().includes(lcSearch)
            );
        });
    }, [search, availableFeatures]);

    const groupedResults = useMemo(() => {
        return searchResults.reduce((map, result) => {
            if (!map[result.category]) {
                map[result.category] = [result];
            } else {
                map[result.category].push(result);
            }
            return map;
        }, {});
    }, [searchResults]);

    const toggleFeatures = (event, feature) => {
        if (event && event.preventDefault) {
            event.preventDefault();
        }
        feature.selected ? onRemoveFeature(feature) : onAddFeature(feature);
    };

    const removeAll = (event) => {
        event.preventDefault();
        onRemoveAllFeatures();
    };

    const onModalClose = (event) => {
        const { firstElementChild } = event;
        firstElementChild.scrollTop = 0;
    };

    return (
        <div id="feature-selector-wrapper" style={{ marginBottom: 0 }}>
            <Modal
                className={`mn-feature-modal modal-lg ${theme}`}
                fixedFooter
                actions={[
                    <Button waves="light" onClick={removeAll} flat>
                        Remove All ({selectedFeatureKeys.length})
                    </Button>,
                    <Button waves="light" modal="close" flat>
                        Done
                    </Button>,
                ]}
                options={{
                    onCloseStart: onModalClose,
                    startingTop: "5%",
                    endingTop: "5%",
                }}
                trigger={
                    <TooltipButton
                        tooltip={messages.tooltips.features}
                        waves="light"
                        className={theme}
                        style={{ marginRight: "5px", width: "100%" }}
                    >
                        <Icon className="action-button-icon" left>
                            add
                        </Icon>
                        Features
                    </TooltipButton>
                }
            >
                <h4>
                    <div className="modal-header">
                        <TextInput
                            className="mn-input"
                            s={12}
                            label="Search Features"
                            placeholder="ex: cassandra"
                            name="search"
                            value={search}
                            autoComplete="off"
                            onChangeText={setSearch}
                        />
                    </div>
                </h4>
                {loading ? (
                    <Preloader />
                ) : (
                    <Col s={12}>
                        {searchResults.length === 0 && (
                            <p>No matching features</p>
                        )}
                        {Object.keys(groupedResults).map((key, index) => {
                            return (
                                <FeatureAvailableGroup
                                    key={key}
                                    category={key}
                                    entities={groupedResults[key]}
                                    toggleFeatures={toggleFeatures}
                                />
                            );
                        })}
                    </Col>
                )}
            </Modal>
        </div>
    );
};

export default FeatureSelectorModal;
