/**
 * Models and Collections for Vue.js
 *
 * @version 0.2.3
 *
 * @author Rudi Theunissen <rudi.theunissen@figured.com>
 */
import Model      from './Structures/Model'
import Collection from './Structures/Collection'
import Request    from './HTTP/Request'
import Response   from './HTTP/Response'

export { Model, Collection, Request, Response }

export {Mutation, AttributesValidationErrors, ValidationResultError, ValidationResult, ValidationTask} from './Structures/Model';
export {Predicate} from './Structures/Collection';
export * from './HTTP/Response';
export * from './HTTP/BaseResponse';
export * from './HTTP/ProxyResponse';
export * from './Errors/ResponseError';
export * from './Errors/RequestError';
export * from './Errors/ValidationError';
export * from './Validation';
export * from './Validation/locale';
