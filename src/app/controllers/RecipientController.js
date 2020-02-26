import User from '../models/User';
import Recipient from '../models/Recipient';

class RecipientController {
    async store(req, res) {
        const user = await User.findOne({ where: { id: req.userId } });

        if (!user.provider) {
            return res.status(401).json({ error: 'User is not a provider' });
        }

        const {
            name,
            street,
            number,
            complement,
            state,
            city,
            zip_code,
        } = await Recipient.create(req.body);

        return res.json({
            name,
            address: {
                street,
                number,
                complement,
                state,
                city,
                zip_code,
            },
        });
    }
}

export default new RecipientController();
