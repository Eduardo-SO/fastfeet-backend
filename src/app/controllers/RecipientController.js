import User from '../models/User';
import Recipient from '../models/Recipient';

class RecipientController {
    async index(req, res) {
        const recipients = await Recipient.findAll();

        return res.json(recipients);
    }

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

    async delete(req, res) {
        const user = await User.findOne({ where: { id: req.userId } });

        if (!user.provider) {
            return res.status(401).json({ error: 'User is not a provider' });
        }

        const { id } = req.params;

        const recipient = await Recipient.findByPk(id);

        if (!recipient) {
            return res
                .status(400)
                .json({ error: 'This recipient does not exist' });
        }

        await recipient.destroy();

        return res.status(204).json();
    }
}

export default new RecipientController();
