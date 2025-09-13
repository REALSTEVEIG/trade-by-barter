"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.OfferStatus = exports.OfferType = void 0;
var OfferType;
(function (OfferType) {
    OfferType["CASH"] = "CASH";
    OfferType["SWAP"] = "SWAP";
    OfferType["HYBRID"] = "HYBRID";
})(OfferType || (exports.OfferType = OfferType = {}));
var OfferStatus;
(function (OfferStatus) {
    OfferStatus["PENDING"] = "PENDING";
    OfferStatus["ACCEPTED"] = "ACCEPTED";
    OfferStatus["REJECTED"] = "REJECTED";
    OfferStatus["COUNTERED"] = "COUNTERED";
    OfferStatus["WITHDRAWN"] = "WITHDRAWN";
    OfferStatus["EXPIRED"] = "EXPIRED";
})(OfferStatus || (exports.OfferStatus = OfferStatus = {}));
//# sourceMappingURL=offer-types.js.map