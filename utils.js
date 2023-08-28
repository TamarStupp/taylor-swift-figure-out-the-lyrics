// type Listeners = { [M in keyof (HTMLElementEventMap & SVGSVGElementEventMap)]?: (this: HTMLElement, e: (HTMLElementEventMap & SVGSVGElementEventMap)[M]) => void }
/**
 * @type {{ [M in keyof (HTMLElementEventMap & SVGSVGElementEventMap)]?: (this: HTMLElement, e: (HTMLElementEventMap & SVGSVGElementEventMap)[M]) => void }} Listeners
 */

// export function El<T>(tagName: string, options?: {
//     classes?: string[], cls?: string,
//     id?: string, fields?: T, attributes?: { [index: string]: string | { toString(): string } }, listeners?: Listeners
// }, ...children: (string | Node)[]): T & HTMLElement;
/**
 * @template T
 * @param {keyof HTMLElementTagNameMap} tagName 
 * @param {{classes?: string[], cls?: string, id?: string, attributes: {[index: string]: string | { toString(): string }}, listeners: Listeners}} options 
 * @param  {...string | Node} children 
 */
function El(tagName, options = {}, ...children) {
    let el = Object.assign(document.createElement(tagName), options.fields || {});
    if (options.classes && options.classes.length) el.classList.add(...options.classes);
    else if (options.cls) el.classList.add(options.cls);
    if (options.id) el.id = options.id;
    el.append(...children.filter(el => el));
    for (let listenerName of Object.keys(options.listeners || {}))
        if (options.listeners[listenerName]) el.addEventListener(listenerName, options.listeners[listenerName], false);
    for (let attributeName of Object.keys(options.attributes || {})) {
        if (options.attributes[attributeName] !== undefined) el.setAttribute(attributeName, options.attributes[attributeName]);
    }
    return el;
}