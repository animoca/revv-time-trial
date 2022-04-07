import React, { useEffect, useState } from 'react';
import './SecondaryNavigationTabs.scss';

export function SecondaryNavigationTabs(props) {
    const { defaultTabKey, outerTitlesWrapperClasses, innerTitlesWrapperClasses, contentWrapperClasses, tabClickedHandler } = props;
    const [titles, setTitles] = useState([]);
    const [contents, setContents] = useState([]);
    const [currentTabKey, setCurrentTabKey] = useState(defaultTabKey);

    useEffect(() => {
        if (defaultTabKey) {
            setCurrentTabKey(defaultTabKey);
        }
    }, [defaultTabKey])

    useEffect(() => {
        const tabs = React.Children.toArray(props.children).filter(element => element.type === SecondaryNavigationTab);
        const titlesToSet = tabs.map((tab, idx) => {
            const titlesPerTab = React.Children.toArray(tab.props.children).filter(element => element.type === SecondaryNavigationTabTitle);
            if (titlesPerTab.length == 1) {
                const title = titlesPerTab.shift();
                return drawTitle(title.props.children, tab.props.tabKey ? tab.props.tabKey : idx, title.props.className, tab.props.overrideTabClickedAction, tab.props.disabled);
            }
            else {
                throw new Error(`"SecondaryNavigationTabs only supports 1 SecondaryNavigationTabTitle per tab, while it has "${titlesPerTab.length}`);
            }
        });

        setTitles(titlesToSet);

        const contentsToSet = tabs.map((tab, idx) => {
            const contentsPerTab = React.Children.toArray(tab.props.children).filter(element => element.type === SecondaryNavigationTabContent);
            if (contentsPerTab.length === 1) {
                const content = contentsPerTab.shift();
                return drawContent(content.props.children, tab.props.tabKey ? tab.props.tabKey : idx, content.props.className);
            }
            else if (contentsPerTab.length > 0) {
                throw new Error(`"SecondaryNavigationTabs only supports no more than 1 SecondaryNavigationTabContent per tab, while it has "${contentsPerTab.length}`);
            }
        })

        setContents(contentsToSet);
    }, [currentTabKey, props.children])

    const drawTitle = (title, tabKey, className, overrideTabClickedAction, disabled) => {
        const clickEvent = () => {
            if (disabled || tabKey === currentTabKey) {
                return;
            }

            if (tabClickedHandler) {
                tabClickedHandler(tabKey);
            }

            if (overrideTabClickedAction) {
                overrideTabClickedAction();
            }
            else {
                setCurrentTabKey(tabKey);
            }
        }
        return <a
            key={tabKey}
            className={`${"tab nav-item nav-link"} ${currentTabKey === tabKey ? "active" : ""} ${className ? className : ""}`}
            onClick={clickEvent}>{title}
        </a>
    }

    const drawContent = (content, tabKey, className) => {
        if (tabKey === currentTabKey) {
            return (
                <div className={className ? className : ""} key={tabKey}>{ content }</div>
            );
        }
    }

    return (
        <div className={`${"secondary-navigation-tabs"} ${props.className ? props.className: ""}`} id={props.id ? props.id : ""}>
            <div className={`${"outer-title-wrapper"} ${outerTitlesWrapperClasses ? outerTitlesWrapperClasses : ""}`}>
                <div className={`${"inner-title-wrapper"} ${innerTitlesWrapperClasses ? innerTitlesWrapperClasses : ""}`}>
                {
                    titles.map((title, _) => {
                        return title;
                    })
                }
                </div>
            </div>
            <div className={`${"content-wrapper"} ${contentWrapperClasses ? contentWrapperClasses : ""}`}>
            {
                contents.map((content, _) => {
                    return content;
                })
            }
            </div>
        </div>
    );
}

SecondaryNavigationTabs.Tab = SecondaryNavigationTab;
SecondaryNavigationTabs.Tab.Title = SecondaryNavigationTabTitle;
SecondaryNavigationTabs.Tab.Content = SecondaryNavigationTabContent;

function SecondaryNavigationTab() {
}

function SecondaryNavigationTabTitle() {
}

function SecondaryNavigationTabContent() {
}
